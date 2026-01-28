import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = "HS256";
const PASSWORD_RESET_PURPOSE = "password_reset";
const PASSWORD_RESET_EXPIRES_IN = "30m";

interface PasswordResetPayload {
  userId: string;
  email: string;
  purpose: typeof PASSWORD_RESET_PURPOSE;
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in environment");
  }
  return JWT_SECRET;
}

export function generatePasswordResetToken(input: {
  userId: string;
  email: string;
}): string {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      userId: input.userId,
      email: input.email,
      purpose: PASSWORD_RESET_PURPOSE,
    },
    secret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: PASSWORD_RESET_EXPIRES_IN,
      subject: input.userId,
    },
  );
}

export function verifyPasswordResetToken(token: string): {
  userId: string;
  email: string;
} {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] });
  if (typeof decoded === "string") throw new Error("Invalid reset token");
  const payload = decoded as JwtPayload & Partial<PasswordResetPayload>;
  if (
    !payload.userId ||
    !payload.email ||
    payload.purpose !== PASSWORD_RESET_PURPOSE
  ) {
    throw new Error("Invalid reset token");
  }
  return { userId: payload.userId, email: payload.email };
}
