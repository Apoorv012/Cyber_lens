import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

function getBearerToken(req: Request): string | null {
  const header = req.header("Authorization");
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;

  return token.trim() || null;
}

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = getBearerToken(req);

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { userId } = verifyAccessToken(token);
    req.user = { id: userId };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function authenticateUserOptional(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = getBearerToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const { userId } = verifyAccessToken(token);
    req.user = { id: userId };
  } catch {
    // Ignore invalid tokens to preserve anonymous flows
  }

  next();
}
