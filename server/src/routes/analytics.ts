import { Router } from "express";
import { authenticateUser } from "../middleware/authenticateUser";
import { analyticsSummaryController } from "../controllers/analyticsSummaryController";

const router = Router();

router.get("/summary", authenticateUser, analyticsSummaryController);

export default router;
