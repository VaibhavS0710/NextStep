import { listInternships } from "./internship.service";
import { ScrapeSource } from "../models/scrapeSource.model";
import { livePreviewScrape } from "./scraping.service";
import { fetchJobsFromApiProvider } from "../utils/apiJobProvider.util";

interface AggregatedInternshipDTO {
  title: string;
  description: string;
  location: string;
  companyName?: string;
  applyUrl?: string;
  source: string;         // "nextstep-db" or external source name
  internalId?: string;    // ONLY for internal DB internships
}

export const getAggregatedInternships = async (params: {
  q?: string;
  location?: string;
  mode?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  const { q, location, mode, type, page = 1, limit = 10 } = params;

  //
  // 1) INTERNAL NEXTSTEP DATABASE INTERNSHIPS
  // (These are NOT posted by companies anymore)
  //
  const dbResult = await listInternships({ q, location, mode, type, page, limit });

  const dbItems: AggregatedInternshipDTO[] = dbResult.items.map((i) => ({
    title: i.title,
    description: i.description,
    location: i.location,
    
    // Internal DB internships do NOT have company names now
    companyName: undefined,
    
    // Students apply within NextStep
    applyUrl: undefined,

    source: "nextstep-db",

    // Keep internal ID (students apply to this ID)
    internalId: i._id.toString(),
  }));

  //
  // 2) EXTERNAL SOURCES (SCRAPING + API PROVIDERS)
  //
  const sources = await ScrapeSource.find({ enabled: true });

  const htmlSources = sources.filter((s) => s.providerType === "html");
  const apiSources = sources.filter((s) => s.providerType === "api");

  const externalPromises: Promise<AggregatedInternshipDTO[]>[] = [];

  // HTML scrapers
  for (const source of htmlSources) {
    externalPromises.push(
      (async () => {
        const scraped = await livePreviewScrape(source._id.toString());
        return scraped.map((item) => ({
          title: item.title,
          description: item.description,
          location: item.location,
          companyName: item.companyName,  // keep external company names
          applyUrl: item.applyUrl,
          source: source.name,
        }));
      })()
    );
  }

  // API providers
  for (const source of apiSources) {
    externalPromises.push(
      (async () => {
        const jobs = await fetchJobsFromApiProvider(source);
        return jobs.map((item) => ({
          title: item.title,
          description: item.description,
          location: item.location,
          companyName: item.companyName,
          applyUrl: item.applyUrl,
          source: source.name,
        }));
      })()
    );
  }

  const externalResultsArrays = await Promise.all(externalPromises);
  const externalItems = externalResultsArrays.flat();

  //
  // 3) MERGE INTERNAL + EXTERNAL
  //
  const allItems = [...dbItems, ...externalItems];

  //
  // 4) FINAL FRONTEND FILTERING
  //
  const filtered = allItems.filter((item) => {
    if (q && !item.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (
      location &&
      !item.location.toLowerCase().includes(location.toLowerCase())
    )
      return false;
    return true;
  });

  return {
    items: filtered,
    total: filtered.length,
    page,
    limit,
  };
};
