import pool from "../db";
import { hashPassword } from "../utils/password";

interface SignupInput {
  email: string;
  password: string;
}

interface SignupResult {
  userId: string;
}

export async function authSignupService(
  input: SignupInput,
): Promise<SignupResult> {
  const { email, password } = input;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  const client = await pool.connect();

  try {
    const existing = await client.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [email],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      throw new Error("Email already registered");
    }

    const passwordHash = await hashPassword(password);

    const result = await client.query(
      `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id
      `,
      [email, passwordHash],
    );

    return {
      userId: result.rows[0].id,
    };
  } finally {
    client.release();
  }
}

// ------- HELPER -------------
function isValidEmail(email: string): boolean {
  // intentionally simple
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
