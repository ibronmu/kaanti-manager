import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  balance: z.union([z.number(), z.string()]).transform(Number).optional(),
});