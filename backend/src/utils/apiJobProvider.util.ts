import axios from "axios";
import { IScrapeSource } from "../models/scrapeSource.model";

export interface ApiJobDTO {
  title: string;
  description: string;
  location: string;
  companyName?: string;
  applyUrl?: string;
}

export const fetchJobsFromApiProvider = async (
  source: IScrapeSource
): Promise<ApiJobDTO[]> => {
  const apiConfig = source.apiConfig;
  if (!apiConfig || !apiConfig.endpoint) {
    throw new Error("API config missing endpoint");
  }

  const endpoint = apiConfig.endpoint;
  const apiKeyEnvVar = apiConfig.apiKeyEnvVar;
  const extraParams = apiConfig.extraParams || {};

  const apiKey = apiKeyEnvVar ? process.env[apiKeyEnvVar] : undefined;

  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await axios.get(endpoint, {
    params: extraParams,
    headers,
  });

  const data = response.data;

  // Assume a shape like: { jobs: [{ title, description, location, company, applyUrl }] }
  const jobs: ApiJobDTO[] = (data.jobs || []).map((job: any) => ({
    title: job.title,
    description: job.description || "",
    location: job.location || "Not specified",
    companyName: job.company || undefined,
    applyUrl: job.applyUrl || undefined,
  }));

  return jobs;
};
