import { Router } from "express";
import {
  newsDetailController,
  newsListController,
} from "../controllers/newsController";

const router = Router();

router.get("/", newsListController);
router.get("/:id", newsDetailController);

export default router;
