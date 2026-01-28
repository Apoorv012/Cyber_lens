import { NextFunction, Request, Response } from "express";
import pool from "../db";

export async function requireVerifiedEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT email_verified FROM users WHERE id = $1 LIMIT 1`,
      [userId],
    );

    if (!result.rowCount) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const emailVerified = result.rows[0].email_verified as boolean;
    req.user = { id: userId, emailVerified };

    if (!emailVerified) {
      res.status(403).json({ error: "Email not verified" });
      return;
    }

    next();
  } catch (error) {
    console.error("requireVerifiedEmail failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
