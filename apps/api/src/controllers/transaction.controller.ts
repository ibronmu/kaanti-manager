import { Response } from "express";
import * as svc from "../services/transaction.service";
import { AuthedRequest } from "../middleware/auth";

const bid = (req: AuthedRequest) => req.params.businessId;

export const list = async (req: AuthedRequest, res: Response) => {
  const result = await svc.listTransactions(bid(req), req.query as any);
  res.json({ success: true, message: "Transactions retrieved", data: result });
};

export const create = async (req: AuthedRequest, res: Response) => {
  const t = await svc.createTransaction(bid(req), req.body);
  res.status(201).json({ success: true, message: "Transaction recorded", data: t });
};

export const getOne = async (req: AuthedRequest, res: Response) => {
  const t = await svc.getTransaction(bid(req), req.params.id);
  res.json({ success: true, message: "Transaction retrieved", data: t });
};

export const update = async (req: AuthedRequest, res: Response) => {
  const t = await svc.updateTransaction(bid(req), req.params.id, req.body);
  res.json({ success: true, message: "Transaction updated", data: t });
};

export const remove = async (req: AuthedRequest, res: Response) => {
  await svc.deleteTransaction(bid(req), req.params.id);
  res.json({ success: true, message: "Transaction deleted" });
};

export const categories = async (req: AuthedRequest, res: Response) => {
  const data = await svc.listCategories(bid(req));
  res.json({ success: true, message: "Categories retrieved", data });
};