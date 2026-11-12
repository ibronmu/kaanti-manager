import { z } from "zod";

const amountSchema = z.union([z.number(), z.string()])
  .transform((v) => Number(v))
  .refine((n) => Number.isFinite(n) && n > 0, { message: "Amount must be positive" })
  .refine((n) => n <= 999_999_999.99, { message: "Amount too large" });

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: amountSchema,
  description: z.string().min(1).max(500),
  date: z.coerce.date(),
  categoryId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const listTransactionsQuery = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});