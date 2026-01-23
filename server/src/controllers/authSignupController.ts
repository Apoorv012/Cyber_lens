import { Request, Response } from "express";
import { authSignupService } from "../services/authSignupService";

/**
 * POST /auth/signup
 *
 * Body:
 * {
 *   "email": string,
 *   "password": string
 * }
 *
 * Response:
 * { "status": "ok" }
 */
export async function authSignupController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, password } = req.body;

    await authSignupService({ email, password });

    res.status(201).json({ status: "ok" });
  } catch (error) {
    // Keep error mapping minimal & safe
    const message = error instanceof Error ? error.message : "Signup failed";

    // Simple, explicit handling (no leaks)
    if (message === "Email already registered") {
      res.status(409).json({ error: message });
      return;
    }

    if (
      message === "Invalid email format" ||
      message === "Email and password are required" ||
      message === "Password must be at least 8 characters long"
    ) {
      res.status(400).json({ error: message });
      return;
    }

    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
