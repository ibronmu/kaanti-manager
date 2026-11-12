import { Response } from "express";
import * as investmentsService from "../services/investments.service";
import { AuthedRequest } from "../middleware/auth";

export const list = async (req: AuthedRequest, res: Response) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const products = await investmentsService.listInvestmentProducts({ category, search });
  res.json({ success: true, message: "Investment products retrieved", data: products });
};

export const getOne = async (req: AuthedRequest, res: Response) => {
  const product = await investmentsService.getInvestmentProduct(req.params.id);
  res.json({ success: true, message: "Investment product retrieved", data: product });
};

export const categories = async (_req: AuthedRequest, res: Response) => {
  const list = await investmentsService.listCategories();
  res.json({ success: true, message: "Categories retrieved", data: list });
};