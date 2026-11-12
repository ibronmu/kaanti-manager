import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export const notFound = (_req: Request, res: Response) =>
  res.status(404).json({ success: false, message: "Route not found" });

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errors: err.details,
    });
  }
  console.error(err);
  return res.status(500).json({ success: false, message: "Internal server error" });
};