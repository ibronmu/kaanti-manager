import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

export const createBusinessForUser = async (
  userId: string,
  input: {
    name: string; category: string; type: string; location: string;
    phone: string; preferredLanguage: "en" | "ha"; currency: string;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const business = await tx.business.create({ data: input });
    await tx.businessMember.create({
      data: { businessId: business.id, userId, role: "OWNER" },
    });

    // Default categories to speed up Phase 2 work
    const incomeDefaults = ["Sales", "Services", "Other Income"];
    const expenseDefaults = ["Supplies", "Rent", "Utilities", "Transport", "Salaries", "Other Expense"];
    await tx.incomeCategory.createMany({
      data: incomeDefaults.map((name) => ({ businessId: business.id, name })),
    });
    await tx.expenseCategory.createMany({
      data: expenseDefaults.map((name) => ({ businessId: business.id, name })),
    });

    return business;
  });
};

export const listBusinessesForUser = async (userId: string) => {
  return prisma.business.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "asc" },
  });
};

export const getBusinessOrThrow = async (businessId: string, userId: string) => {
  const membership = await prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId } },
    include: { business: true },
  });
  if (!membership) throw new AppError("Business not found or access denied", 404);
  return membership.business;
};

export const updateBusiness = async (
  businessId: string,
  userId: string,
  patch: Partial<{
    name: string; category: string; type: string; location: string;
    phone: string; preferredLanguage: "en" | "ha"; currency: string;
  }>
) => {
  await getBusinessOrThrow(businessId, userId); // authorization check
  return prisma.business.update({ where: { id: businessId }, data: patch });
};