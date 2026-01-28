import pool from "../db";
import { hashPassword } from "../utils/password";
import { generateEmailVerificationToken } from "./emailVerificationToken";
import { sendEmail } from "./emailService";

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
      INSERT INTO users (email, password_hash, last_verification_sent_at)
      VALUES ($1, $2, NOW())
      RETURNING id
      `,
      [email, passwordHash],
    );

    const userId = result.rows[0].id;

    const token = generateEmailVerificationToken({
      userId,
      email,
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Verify your email — Cyber Lens",
      verificationLink,
    });

    return { userId };
  } finally {
    client.release();
  }
}

// ------- HELPER -------------
function isValidEmail(email: string): boolean {
  // intentionally simple
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
