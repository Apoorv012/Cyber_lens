import { Request, Response } from "express";
import { getUserAnalyticsSummary } from "../services/analyticsSummaryService";

export async function analyticsSummaryController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const summary = await getUserAnalyticsSummary(userId);

    return res.json(summary);
  } catch (error) {
    console.error("Analytics summary failed:", error);
    return res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
}
