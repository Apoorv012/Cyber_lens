import crypto from "crypto";
import pool from "../db";

// Generate secure random token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}


// Hash token for storage
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}


/**
 * Creates and stores a magic link in the database
 */
export async function createMagicLink(
  userId: string,
  type: "delete_account" | "verify_email",
  expiresInMinutes = 15
): Promise<string> {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

  await pool.query(
    "INSERT INTO magic_links (user_id, token_hash, expires_at, type) VALUES ($1, $2, $3, $4)",
    [userId, tokenHash, expiresAt, type]
  );

  return token;
}

/**
 * Validates a magic link token and returns the associated userId
 */
export async function verifyMagicLink(
  token: string,
  type: string
): Promise<string | null> {
  const tokenHash = hashToken(token);

  const result = await pool.query(
    "SELECT user_id FROM magic_links WHERE token_hash = $1 AND type = $2 AND expires_at > NOW() AND used_at IS NULL",
    [tokenHash, type]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const userId = result.rows[0].user_id;

  // Atomically mark token as used to prevent replay attacks
  await pool.query(
    "UPDATE magic_links SET used_at = NOW() WHERE token_hash = $1",
    [tokenHash]
  );

  return userId;
}

// Mock email sender - logs to console only
export async function sendMagicLinkEmail(
  email: string,
  token: string,
  type: string
): Promise<void> {
  const baseUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
  // The link points to a verification endpoint that will handle the logic
  const link = `${baseUrl}/verify-action?token=${token}&type=${type}`;

  console.log("\n--- [INTERNAL MAIL SERVICE] ---");
  console.log(`Target: ${email}`);
  console.log(`Action: ${type.toUpperCase()}`);
  console.log(`Verification URL: ${link}`);
  console.log("Validity: 15 minutes (Single Use Only)");
  console.log("-------------------------------\n");
}
