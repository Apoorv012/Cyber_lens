import { Request, Response } from "express";
import { sendEmail } from "../services/emailService";
import {
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from "../services/passwordResetToken";
import pool from "../db";
import { hashPassword } from "../utils/password";

// POST /auth/request-password-reset
export async function requestPasswordResetController(
  req: Request,
  res: Response,
) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Always respond with success to avoid leaking user existence
  let userId: string | null = null;
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email],
    );
    if (result.rowCount && result.rows[0]) userId = result.rows[0].id;
    client.release();
  } catch {}

  if (userId) {
    const token = generatePasswordResetToken({ userId, email });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: email,
      subject: "Reset your Cyber Lens password",
      verificationLink: resetLink,
    });
  }
  return res.json({
    message: "If an account exists for this email, a reset link has been sent.",
  });
}

// POST /auth/reset-password
export async function resetPasswordController(req: Request, res: Response) {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: "Token and password are required" });

  let payload: { userId: string; email: string };
  try {
    payload = verifyPasswordResetToken(token);
  } catch (e) {
    return res.status(400).json({ message: "Invalid or expired link" });
  }

  try {
    const passwordHash = await hashPassword(password);
    const client = await pool.connect();
    await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      payload.userId,
    ]);
    client.release();
    return res.json({ message: "Password reset successful" });
  } catch {
    return res.status(500).json({ message: "Failed to reset password" });
  }
}
