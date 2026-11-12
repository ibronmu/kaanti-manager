import { Response } from "express";
import { computeReadiness } from "../services/readiness.service";
import { AuthedRequest } from "../middleware/auth";

export const get = async (req: AuthedRequest, res: Response) => {
  const summary = await computeReadiness(req.params.businessId);
  res.json({ success: true, message: "Financial readiness summary computed", data: summary });
};