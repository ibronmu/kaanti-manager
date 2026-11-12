import { z } from "zod";

export const createInventoryItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  quantity: z.coerce.number().int().nonnegative().default(0),
  costPrice: z.coerce.number().nonnegative(),
  sellPrice: z.coerce.number().nonnegative(),
  lowStock: z.coerce.number().int().nonnegative().default(5),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();