import { Response } from "express";
import * as financingService from "../services/financing.service";
import { AuthedRequest } from "../middleware/auth";

export const list = async (req: AuthedRequest, res: Response) => {
  const structure = typeof req.query.structure === "string" ? req.query.structure : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const products = await financingService.listFinancingProducts({ structure, search });
  res.json({ success: true, message: "Financing products retrieved", data: products });
};

export const getOne = async (req: AuthedRequest, res: Response) => {
  const product = await financingService.getFinancingProduct(req.params.id);
  res.json({ success: true, message: "Financing product retrieved", data: product });
};

export const structures = async (_req: AuthedRequest, res: Response) => {
  const list = await financingService.listAvailableStructures();
  res.json({ success: true, message: "Structures retrieved", data: list });
};

export const expressInterest = async (req: AuthedRequest, res: Response) => {
  const result = await financingService.expressInterest(req.user!.id, req.params.id);
  res.status(201).json({ success: true, message: result.message, data: result });
};

export const myInterests = async (req: AuthedRequest, res: Response) => {
  const list = await financingService.listMyInterests(req.user!.id);
  res.json({ success: true, message: "Interests retrieved", data: list });
};