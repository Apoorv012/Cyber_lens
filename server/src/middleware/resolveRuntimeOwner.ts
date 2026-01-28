import { NextFunction, Request, Response } from "express";
import type { OwnerContext } from "../constants/owner";

function resolveFromUser(req: Request): OwnerContext | null {
  if (!req.user?.id) return null;

  return { type: "user", id: req.user.id };
}

function resolveFromAnonymous(req: Request): OwnerContext | null {
  if (!req.owner) return null;

  return req.owner;
}

export function resolveRuntimeOwner(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.method === "OPTIONS") {
    next();
    return;
  }

  // Allow public verification link without owner context
  if (req.path.startsWith("/auth/verify-email")) {
    next();
    return;
  }

  const userOwner = resolveFromUser(req);

  if (userOwner) {
    req.owner = userOwner;
    next();
    return;
  }

  const anonymousOwner = resolveFromAnonymous(req);

  if (anonymousOwner) {
    req.owner = anonymousOwner;
    next();
    return;
  }

  res.status(400).json({ error: "Owner not resolved" });
}

export default resolveRuntimeOwner;
