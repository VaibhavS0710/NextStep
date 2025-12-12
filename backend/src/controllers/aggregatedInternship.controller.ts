import { Request, Response } from "express";
import { getAggregatedInternships } from "../services/aggregatedInternship.service";

export const getAggregatedInternshipsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { q, location, mode, type, page, limit } = req.query;

    const result = await getAggregatedInternships({
      q: q as string | undefined,
      location: location as string | undefined,
      mode: mode as string | undefined,
      type: type as string | undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Failed to fetch aggregated internships",
    });
  }
};
