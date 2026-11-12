import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";
import { AuthedRequest } from "./auth";

/**
 * Verifies that req.user is a member of the business identified by `businessId`.
 * Attaches `req.businessMembership` if successful.
 */
export const requireBusinessAccess = async (
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const businessId = req.params.businessId ?? (req.body.businessId as string | undefined);
    if (!businessId) return next(new AppError("businessId is required", 400));

    const membership = await prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId, userId: req.user!.id } },
    });
    if (!membership) return next(new AppError("Access to this business is denied", 403));

    (req as any).businessMembership = membership;
    next();
  } catch (err) {
    next(err);
  }
};