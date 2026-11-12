import { Response } from "express";
import * as businessService from "../services/business.service";
import { AuthedRequest } from "../middleware/auth";
import * as txnSvc from "../services/transaction.service";

export const listMine = async (req: AuthedRequest, res: Response) => {
  const list = await businessService.listBusinessesForUser(req.user!.id);
  res.json({ success: true, message: "Businesses retrieved", data: list });
};

export const onboard = async (req: AuthedRequest, res: Response) => {
  const business = await businessService.createBusinessForUser(req.user!.id, req.body);
  res.status(201).json({ success: true, message: "Business created", data: business });
};

export const getOne = async (req: AuthedRequest, res: Response) => {
  const business = await businessService.getBusinessOrThrow(req.params.businessId, req.user!.id);
  res.json({ success: true, message: "Business retrieved", data: business });
};

export const update = async (req: AuthedRequest, res: Response) => {
  const business = await businessService.updateBusiness(req.params.businessId, req.user!.id, req.body);
  res.json({ success: true, message: "Business updated", data: business });
};


export const dashboard = async (req: AuthedRequest, res: Response) => {
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  const data = await txnSvc.dashboardSummary(req.params.businessId, from, to);
  res.json({ success: true, message: "Dashboard retrieved", data });
};