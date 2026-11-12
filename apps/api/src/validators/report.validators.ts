import { z } from "zod";

export const createReportSchema = z.object({
  title: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  format: z.enum(["PDF", "CSV"]),
  metadata: z.record(z.unknown()).optional(),
});