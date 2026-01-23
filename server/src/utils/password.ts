// hashPassword(password: string): Promise<string>;
// verifyPassword(password: string, hash: string): Promise<boolean>;

import bcrypt from "bcrypt";

const BCRYPT_COST = 12;

/**
 * Hash a plain-text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  const salt = await bcrypt.genSalt(BCRYPT_COST);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
}
