import { Response } from "express";
import * as svc from "../services/inventory.service";
import { AuthedRequest } from "../middleware/auth";

const bid = (req: AuthedRequest) => req.params.businessId;

export const list = async (req: AuthedRequest, res: Response) => {
  const items = await svc.listInventory(bid(req), (req.query.q as string) || undefined);
  res.json({ success: true, message: "Inventory retrieved", data: items });
};
export const create = async (req: AuthedRequest, res: Response) => {
  const item = await svc.createInventoryItem(bid(req), req.body);
  res.status(201).json({ success: true, message: "Item created", data: item });
};
export const update = async (req: AuthedRequest, res: Response) => {
  const item = await svc.updateInventoryItem(bid(req), req.params.id, req.body);
  res.json({ success: true, message: "Item updated", data: item });
};
export const remove = async (req: AuthedRequest, res: Response) => {
  await svc.deleteInventoryItem(bid(req), req.params.id);
  res.json({ success: true, message: "Item deleted" });
};