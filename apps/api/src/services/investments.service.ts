import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

export const listInvestmentProducts = async (filters: { category?: string; search?: string }) => {
  return prisma.investmentProduct.findMany({
    where: {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search
        ? { OR: [{ name: { contains: filters.search, mode: "insensitive" } }, { description: { contains: filters.search, mode: "insensitive" } }] }
        : {}),
    },
    include: { partner: true },
    orderBy: [{ isDemo: "desc" }, { name: "asc" }],
  });
};

export const getInvestmentProduct = async (id: string) => {
  const product = await prisma.investmentProduct.findUnique({
    where: { id },
    include: { partner: true },
  });
  if (!product) throw new AppError("Investment product not found", 404);
  return product;
};

export const listCategories = async () => {
  const rows = await prisma.investmentProduct.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
};