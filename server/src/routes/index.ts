import { Router } from "express";
import { authSignupController } from "../controllers/authSignupController";
import { authLoginController } from "../controllers/authLoginController";
import { authVerifyEmailController } from "../controllers/authVerifyEmailController";
import { resendVerificationController } from "../controllers/resendVerificationController";
import { authenticateUser } from "../middleware/authenticateUser";
import {
  requestPasswordResetController,
  resetPasswordController,
} from "../controllers/authPasswordResetController";
const router = Router();
router.get("/auth/me", authenticateUser, (req, res) => {
  res.json({ userId: req.user?.id });
});

router.post("/auth/signup", authSignupController);
router.post("/auth/login", authLoginController);
router.get("/auth/verify-email", authVerifyEmailController);
router.post("/auth/resend-verification", resendVerificationController);

// Password reset endpoints
router.post("/auth/request-password-reset", requestPasswordResetController);
router.post("/auth/reset-password", resetPasswordController);

export default router;
