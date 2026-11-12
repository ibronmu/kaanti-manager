import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

export const listFinancingProducts = async (filters: { structure?: string; search?: string }) => {
  return prisma.financingProduct.findMany({
    where: {
      ...(filters.structure ? { structure: filters.structure } : {}),
      ...(filters.search
        ? { OR: [{ name: { contains: filters.search, mode: "insensitive" } }, { description: { contains: filters.search, mode: "insensitive" } }] }
        : {}),
    },
    include: { partner: true },
    orderBy: [{ isDemo: "desc" }, { name: "asc" }],
  });
};

export const getFinancingProduct = async (id: string) => {
  const product = await prisma.financingProduct.findUnique({
    where: { id },
    include: { partner: true },
  });
  if (!product) throw new AppError("Financing product not found", 404);
  return product;
};

export const listAvailableStructures = async () => {
  const rows = await prisma.financingProduct.findMany({
    select: { structure: true },
    distinct: ["structure"],
    orderBy: { structure: "asc" },
  });
  return rows.map((r) => r.structure);
};

export const expressInterest = async (userId: string, productId: string) => {
  const product = await prisma.financingProduct.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Financing product not found", 404);

  await prisma.financingInterest.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });

  return {
    message: "Interest recorded. Please contact the provider directly to proceed.",
    providerNote: "Kaanti Manager does not approve financing. Assessment, approval and contracting are handled by the authorised financial institution.",
  };
};

export const listMyInterests = async (userId: string) => {
  return prisma.financingInterest.findMany({
    where: { userId },
    include: { product: { include: { partner: true } } },
    orderBy: { createdAt: "desc" },
  });
};