import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

export const listCustomers = (businessId: string, q?: string) =>
  prisma.customer.findMany({
    where: {
      businessId,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
  });

export const createCustomer = (
  businessId: string,
  input: { name: string; phone?: string; email?: string }
) =>
  prisma.customer.create({
    data: {
      businessId,
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
    },
  });

export const updateCustomer = async (
  businessId: string,
  id: string,
  patch: Partial<{ name: string; phone?: string; email?: string; balance: number }>
) => {
  const existing = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!existing) throw new AppError("Customer not found", 404);
  const data: any = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.phone !== undefined) data.phone = patch.phone || null;
  if (patch.email !== undefined) data.email = patch.email || null;
  if (patch.balance !== undefined) data.balance = patch.balance.toFixed(2);
  return prisma.customer.update({ where: { id }, data });
};

export const deleteCustomer = async (businessId: string, id: string) => {
  const existing = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!existing) throw new AppError("Customer not found", 404);
  // Detach from any transactions rather than cascade-delete them.
  await prisma.transaction.updateMany({ where: { customerId: id }, data: { customerId: null } });
  await prisma.customer.delete({ where: { id } });
};