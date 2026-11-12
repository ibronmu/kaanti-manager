import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

const decimal = (n: number) => new Prisma.Decimal(n.toFixed(2));

export const listInventory = (businessId: string, q?: string) =>
  prisma.inventoryItem.findMany({
    where: {
      businessId,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
  });

export const createInventoryItem = (
  businessId: string,
  input: { name: string; sku?: string; quantity: number; costPrice: number; sellPrice: number; lowStock: number }
) =>
  prisma.inventoryItem.create({
    data: {
      businessId,
      name: input.name,
      sku: input.sku || null,
      quantity: input.quantity,
      costPrice: decimal(input.costPrice),
      sellPrice: decimal(input.sellPrice),
      lowStock: input.lowStock,
    },
  });

export const updateInventoryItem = async (
  businessId: string,
  id: string,
  patch: Partial<{ name: string; sku?: string; quantity: number; costPrice: number; sellPrice: number; lowStock: number }>
) => {
  const existing = await prisma.inventoryItem.findFirst({ where: { id, businessId } });
  if (!existing) throw new AppError("Inventory item not found", 404);

  const data: Prisma.InventoryItemUpdateInput = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.sku !== undefined) data.sku = patch.sku || null;
  if (patch.quantity !== undefined) data.quantity = patch.quantity;
  if (patch.lowStock !== undefined) data.lowStock = patch.lowStock;
  if (patch.costPrice !== undefined) data.costPrice = decimal(patch.costPrice);
  if (patch.sellPrice !== undefined) data.sellPrice = decimal(patch.sellPrice);

  return prisma.inventoryItem.update({ where: { id }, data });
};

export const deleteInventoryItem = async (businessId: string, id: string) => {
  const existing = await prisma.inventoryItem.findFirst({ where: { id, businessId } });
  if (!existing) throw new AppError("Inventory item not found", 404);
  await prisma.inventoryItem.delete({ where: { id } });
};