import { Router, Request, Response } from "express";
import pool from "../db";
import crypto from "crypto";
import {
  createMagicLink,
  sendMagicLinkEmail,
  verifyMagicLink,
} from "../utils/magicLink";

const router = Router();

// TODO: Use bcrypt in production
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}


// POST /auth/change-password
router.post("/change-password", async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const owner = req.owner;

  if (owner.type !== "user") {
    res.status(401).json({ error: "Authenticated user account required" });
    return;
  }

  try {
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [owner.id]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }

    const { password_hash } = userResult.rows[0];

    if (hashPassword(currentPassword) !== password_hash) {
      res.status(400).json({ error: "The current password you entered is incorrect" });
      return;
    }

    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [hashPassword(newPassword), owner.id]
    );

    res.json({ message: "Security credentials updated successfully" });
  } catch (error) {
    console.error("Change password failure:", error);
    res.status(500).json({ error: "An internal error occurred while updating security settings" });
  }
});

// POST /auth/request-delete
router.post("/request-delete", async (req: Request, res: Response) => {
  const owner = req.owner;

  if (owner.type !== "user") {
    res.status(401).json({ error: "Authenticated user session required" });
    return;
  }

  try {
    const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [
      owner.id,
    ]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User identity not found" });
      return;
    }

    const { email } = userResult.rows[0];
    const token = await createMagicLink(owner.id, "delete_account");

    await sendMagicLinkEmail(email, token, "delete_account");

    res.json({ message: "Verification link dispatched to your email" });
  } catch (error) {
    console.error("Delete request failure:", error);
    res.status(500).json({ error: "Failed to initiate account deletion sequence" });
  }
});

// POST /auth/verify-delete
router.post("/verify-delete", async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ error: "Verification token is missing" });
    return;
  }

  try {
    const userId = await verifyMagicLink(token, "delete_account");

    if (!userId) {
      res.status(400).json({ error: "The verification link is invalid or has expired" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Clear all historical data associated with the user
      await client.query(
        "DELETE FROM ioc_history WHERE owner_type = 'user' AND owner_id = $1",
        [userId]
      );

      // Finalize account termination
      await client.query("DELETE FROM users WHERE id = $1", [userId]);

      await client.query("COMMIT");
      res.json({ message: "Account and associated history terminated successfully" });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Delete verification failure:", error);
    res.status(500).json({ error: "A system error occurred during account termination" });
  }
});

/**
 * MOCK SIGNUP (For Testing Purposes)
 * Allows creation of a test user to verify Settings functionality
 */
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email, hashPassword(password)]
    );
    res.json({ success: true, userId: result.rows[0].id });
  } catch (error) {
     res.status(400).json({ error: "User already exists or invalid data" });
  }
});

export default router;
