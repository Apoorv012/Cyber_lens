import { Request, Response } from "express";
import pool from "../db";
import { generateEmailVerificationToken } from "../services/emailVerificationToken";
import { sendEmail } from "../services/emailService";

/**
 * POST /auth/resend-verification
 * Body: { email: string }
 * Response: { status: "ok" | "already_verified" }
 */
export async function resendVerificationController(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  const client = await pool.connect();
  try {
    // Find user by email (do not reveal if not found)
    const userResult = await client.query(
      `SELECT id, email_verified, last_verification_sent_at FROM users WHERE email = $1 LIMIT 1`,
      [email],
    );
    if (!userResult.rowCount) {
      // Always return ok to avoid leaking user existence
      res.json({ status: "ok" });
      return;
    }
    const user = userResult.rows[0];
    if (user.email_verified) {
      res.json({ status: "already_verified" });
      return;
    }
    // Cooldown: 60s
    const now = new Date();
    if (
      user.last_verification_sent_at &&
      now.getTime() - new Date(user.last_verification_sent_at).getTime() < 60000
    ) {
      res.json({ status: "ok" });
      return;
    }
    // Generate new token and send email
    const token = generateEmailVerificationToken({ userId: user.id, email });
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
    const verificationLink = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: email,
      subject: "Verify your email address",
      verificationLink,
    });
    // Update last_verification_sent_at
    await client.query(
      `UPDATE users SET last_verification_sent_at = NOW() WHERE id = $1`,
      [user.id],
    );
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}
