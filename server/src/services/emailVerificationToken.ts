import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = "HS256";
const EMAIL_VERIFICATION_PURPOSE = "email_verification";
const EMAIL_VERIFICATION_EXPIRES_IN = "1h";

interface EmailVerificationPayload {
  userId: string;
  email: string;
  purpose: typeof EMAIL_VERIFICATION_PURPOSE;
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in environment");
  }

  return JWT_SECRET;
}

export function generateEmailVerificationToken(input: {
  userId: string;
  email: string;
}): string {
  const secret = getJwtSecret();

  return jwt.sign(
    {
      userId: input.userId,
      email: input.email,
      purpose: EMAIL_VERIFICATION_PURPOSE,
    },
    secret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: EMAIL_VERIFICATION_EXPIRES_IN,
      subject: input.userId,
    },
  );
}

export function verifyEmailVerificationToken(token: string): {
  userId: string;
  email: string;
} {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret, {
    algorithms: [JWT_ALGORITHM],
  });

  if (typeof decoded === "string") {
    throw new Error("Invalid verification token");
  }

  const payload = decoded as JwtPayload & Partial<EmailVerificationPayload>;

  if (
    !payload.userId ||
    !payload.email ||
    payload.purpose !== EMAIL_VERIFICATION_PURPOSE
  ) {
    throw new Error("Invalid verification token");
  }

  return { userId: payload.userId, email: payload.email };
}
