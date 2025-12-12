import axios from "axios";
import * as cheerio from "cheerio";
import { IScrapeSource } from "../models/scrapeSource.model";

export interface ScrapedInternshipDTO {
  title: string;
  description: string;
  location: string;
  companyName?: string;
  applyUrl?: string;
}

export const scrapeSourceHtml = async (
  source: IScrapeSource
): Promise<ScrapedInternshipDTO[]> => {
  const url = source.listPath
    ? `${source.baseUrl}${source.listPath}`
    : source.baseUrl;

  const selectors = source.selectors || {};
  const itemSelector = selectors["item"];
  const titleSelector = selectors["title"];
  const locationSelector = selectors["location"];
  const companySelector = selectors["company"];
  const linkSelector = selectors["link"];

  if (!itemSelector || !titleSelector) {
    throw new Error(
      "Scrape source is missing required selectors: 'item' and/or 'title'"
    );
  }

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const results: ScrapedInternshipDTO[] = [];

  $(itemSelector).each((_idx, el) => {
    const $el = $(el);

    const title = titleSelector ? $el.find(titleSelector).text().trim() : "";
    if (!title) return;

    const location = locationSelector
      ? $el.find(locationSelector).text().trim()
      : "Not specified";

    const companyName = companySelector
      ? $el.find(companySelector).text().trim()
      : undefined;

    let applyUrl: string | undefined;
    if (linkSelector) {
      const href = $el.find(linkSelector).attr("href");
      if (href) {
        applyUrl = href.startsWith("http")
          ? href
          : source.baseUrl.replace(/\/$/, "") + href;
      }
    }

    const description = `${title}${
      companyName ? ` at ${companyName}` : ""
    } - ${location}`;

    results.push({
      title,
      description,
      location,
      companyName,
      applyUrl,
    });
  });

  return results;
};
