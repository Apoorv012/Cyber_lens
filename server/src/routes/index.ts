import { Router } from "express";
import { authSignupController } from "../controllers/authSignupController";
import { authLoginController } from "../controllers/authLoginController";
import { authenticateUser } from "../middleware/authenticateUser";
const router = Router();
router.get("/auth/me", authenticateUser, (req, res) => {
  res.json({ userId: req.user?.id });
});

router.post("/auth/signup", authSignupController);
router.post("/auth/login", authLoginController);

export default router;
