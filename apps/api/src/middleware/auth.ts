import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { verifyAccess } from "../utils/tokens";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

export const requireAuth = (req: AuthedRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const cookieToken = (req as any).cookies?.access_token as string | undefined;
  const token = bearer ?? cookieToken;

  if (!token) return next(new AppError("Authentication required", 401));

  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};