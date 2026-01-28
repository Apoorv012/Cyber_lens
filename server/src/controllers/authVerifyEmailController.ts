import { Request, Response } from "express";
import pool from "../db";
import { verifyEmailVerificationToken } from "../services/emailVerificationToken";

export async function authVerifyEmailController(
  req: Request,
  res: Response,
): Promise<void> {
  const token = req.query.token;

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Verification token is required" });
    return;
  }

  let payload: { userId: string; email: string };

  try {
    payload = verifyEmailVerificationToken(token);
  } catch (error) {
    const name = error instanceof Error ? error.name : "";

    if (name === "TokenExpiredError") {
      res.status(400).json({ error: "Verification link has expired" });
      return;
    }

    res.status(400).json({ error: "Invalid verification token" });
    return;
  }

  const client = await pool.connect();

  try {
    const userResult = await client.query(
      `
      SELECT id, email_verified
      FROM users
      WHERE id = $1 AND email = $2
      LIMIT 1
      `,
      [payload.userId, payload.email],
    );

    if (!userResult.rowCount) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userResult.rows[0] as { email_verified: boolean };

    if (user.email_verified) {
      res.status(200).json({ status: "already_verified" });
      return;
    }

    await client.query(
      `UPDATE users SET email_verified = TRUE WHERE id = $1`,
      [payload.userId],
    );

    res.status(200).json({ status: "verified" });
  } catch (error) {
    console.error("Email verification failed:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}
