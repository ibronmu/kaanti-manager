import { Response } from "express";
import { AuthedRequest } from "../middleware/auth";
import { transactionsCsv } from "../services/report.service";
import { AppError } from "../utils/errors";

export const downloadTransactionsCsv = async (req: AuthedRequest, res: Response) => {
  const fromStr = (req.query.from as string) || "";
  const toStr = (req.query.to as string) || "";
  if (!fromStr || !toStr) throw new AppError("from and to query params required (YYYY-MM-DD)", 400);
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) throw new AppError("Invalid date", 400);
  if (to < from) throw new AppError("`to` must be after `from`", 400);

  const csv = await transactionsCsv(req.params.businessId, from, to);
  const filename = `transactions-${fromStr}-to-${toStr}.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
};