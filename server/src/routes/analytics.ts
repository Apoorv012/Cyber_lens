import { Router } from "express";
import { analyticsSummaryController } from "../controllers/analyticsSummaryController";

const router = Router();

router.get("/summary", analyticsSummaryController);

export default router;
