import { Response } from "express";
import * as svc from "../services/customer.service";
import { AuthedRequest } from "../middleware/auth";

const bid = (req: AuthedRequest) => req.params.businessId;

export const list = async (req: AuthedRequest, res: Response) => {
  const items = await svc.listCustomers(bid(req), (req.query.q as string) || undefined);
  res.json({ success: true, message: "Customers retrieved", data: items });
};
export const create = async (req: AuthedRequest, res: Response) => {
  const c = await svc.createCustomer(bid(req), req.body);
  res.status(201).json({ success: true, message: "Customer created", data: c });
};
export const update = async (req: AuthedRequest, res: Response) => {
  const c = await svc.updateCustomer(bid(req), req.params.id, req.body);
  res.json({ success: true, message: "Customer updated", data: c });
};
export const remove = async (req: AuthedRequest, res: Response) => {
  await svc.deleteCustomer(bid(req), req.params.id);
  res.json({ success: true, message: "Customer deleted" });
};