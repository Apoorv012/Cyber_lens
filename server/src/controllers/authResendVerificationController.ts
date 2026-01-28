import { Request, Response } from "express";
import { authResendVerificationService } from "../services/authResendVerificationService";

export async function authResendVerificationController(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(200).json({ status: "ok" });
    return;
  }

  try {
    const result = await authResendVerificationService(email);

    if (result?.status === "already_verified") {
      res.status(200).json({ status: "already_verified" });
      return;
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(200).json({ status: "ok" });
  }
}
