import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

interface CreateInput {
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: Date;
  categoryId: string;
  customerId?: string;
}

interface ListFilters {
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  customerId?: string;
  from?: Date;
  to?: Date;
  q?: string;
  page: number;
  pageSize: number;
}

const decimal = (n: number) => new Prisma.Decimal(n.toFixed(2));

const resolveCategory = async (
  businessId: string,
  type: "INCOME" | "EXPENSE",
  categoryId: string
) => {
  if (type === "INCOME") {
    const c = await prisma.incomeCategory.findFirst({ where: { id: categoryId, businessId } });
    if (!c) throw new AppError("Income category not found for this business", 400);
    return { incomeCategoryId: c.id, expenseCategoryId: null as string | null };
  }
  const c = await prisma.expenseCategory.findFirst({ where: { id: categoryId, businessId } });
  if (!c) throw new AppError("Expense category not found for this business", 400);
  return { incomeCategoryId: null as string | null, expenseCategoryId: c.id };
};

export const createTransaction = async (businessId: string, input: CreateInput) => {
  const cats = await resolveCategory(businessId, input.type, input.categoryId);
  return prisma.transaction.create({
    data: {
      businessId,
      type: input.type,
      amount: decimal(input.amount),
      description: input.description,
      date: input.date,
      customerId: input.customerId ?? null,
      ...cats,
    },
    include: { incomeCategory: true, expenseCategory: true, customer: true },
  });
};

export const listTransactions = async (businessId: string, f: ListFilters) => {
  const where: Prisma.TransactionWhereInput = { businessId };
  if (f.type) where.type = f.type;
  if (f.customerId) where.customerId = f.customerId;
  if (f.from || f.to) where.date = {};
  if (f.from) (where.date as Prisma.DateTimeFilter).gte = f.from;
  if (f.to)   (where.date as Prisma.DateTimeFilter).lte = f.to;
  if (f.q) where.description = { contains: f.q, mode: "insensitive" };
  if (f.categoryId) {
    where.OR = [
      { incomeCategoryId: f.categoryId },
      { expenseCategoryId: f.categoryId },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: { incomeCategory: true, expenseCategory: true, customer: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page: f.page, pageSize: f.pageSize };
};

export const getTransaction = async (businessId: string, id: string) => {
  const t = await prisma.transaction.findFirst({
    where: { id, businessId },
    include: { incomeCategory: true, expenseCategory: true, customer: true },
  });
  if (!t) throw new AppError("Transaction not found", 404);
  return t;
};

export const updateTransaction = async (
  businessId: string,
  id: string,
  patch: Partial<CreateInput>
) => {
  const existing = await prisma.transaction.findFirst({ where: { id, businessId } });
  if (!existing) throw new AppError("Transaction not found", 404);

  const data: Prisma.TransactionUpdateInput = {};
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.date !== undefined) data.date = patch.date;
  if (patch.customerId !== undefined) {
    data.customer = patch.customerId ? { connect: { id: patch.customerId } } : { disconnect: true };
  }
  if (patch.amount !== undefined) data.amount = decimal(patch.amount);

  // If type and/or categoryId change together, re-resolve.
  if (patch.type || patch.categoryId) {
    const nextType = patch.type ?? existing.type;
    const nextCategoryId =
      patch.categoryId ??
      (nextType === "INCOME" ? existing.incomeCategoryId : existing.expenseCategoryId);
    if (!nextCategoryId) throw new AppError("Category required", 400);
    const cats = await resolveCategory(businessId, nextType, nextCategoryId);
    data.type = nextType;
    data.incomeCategory = cats.incomeCategoryId ? { connect: { id: cats.incomeCategoryId } } : { disconnect: true };
    data.expenseCategory = cats.expenseCategoryId ? { connect: { id: cats.expenseCategoryId } } : { disconnect: true };
  }

  return prisma.transaction.update({
    where: { id },
    data,
    include: { incomeCategory: true, expenseCategory: true, customer: true },
  });
};

export const deleteTransaction = async (businessId: string, id: string) => {
  const existing = await prisma.transaction.findFirst({ where: { id, businessId } });
  if (!existing) throw new AppError("Transaction not found", 404);
  await prisma.transaction.delete({ where: { id } });
};

export const listCategories = async (businessId: string) => {
  const [income, expense] = await Promise.all([
    prisma.incomeCategory.findMany({ where: { businessId }, orderBy: { name: "asc" } }),
    prisma.expenseCategory.findMany({ where: { businessId }, orderBy: { name: "asc" } }),
  ]);
  return { income, expense };
};

/** Dashboard summary. `from`/`to` default to current month. */
export const dashboardSummary = async (
  businessId: string,
  from?: Date,
  to?: Date
) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const start = from ?? monthStart;
  const end = to ?? monthEnd;

  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: { businessId, date: { gte: start, lte: end } },
    _sum: { amount: true },
    _count: true,
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  let transactionCount = 0;
  for (const g of grouped) {
    const sum = Number(g._sum.amount ?? 0);
    transactionCount += g._count;
    if (g.type === "INCOME") totalIncome = sum;
    else totalExpenses = sum;
  }

  const recent = await prisma.transaction.findMany({
    where: { businessId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 5,
    include: { incomeCategory: true, expenseCategory: true },
  });

  // Last 6 months of income/expense, aggregated in memory (fine for SME volumes).
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const series = await prisma.transaction.findMany({
    where: { businessId, date: { gte: sixMonthsAgo } },
    select: { type: true, amount: true, date: true },
  });
  const buckets: Record<string, { income: number; expense: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets[key] = { income: 0, expense: 0 };
  }
  for (const t of series) {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) continue;
    const n = Number(t.amount);
    if (t.type === "INCOME") buckets[key].income += n;
    else buckets[key].expense += n;
  }
  const monthlySeries = Object.keys(buckets).sort().map((month) => ({ month, ...buckets[month] }));

  const lowStock = await prisma.inventoryItem.findMany({
    where: { businessId },
    select: { quantity: true, lowStock: true },
  });
  const lowStockCount = lowStock.filter((i) => i.quantity <= i.lowStock).length;

  return {
    totalIncome: totalIncome.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    netCashFlow: (totalIncome - totalExpenses).toFixed(2),
    transactionCount,
    recentTransactions: recent,
    monthlySeries,
    lowStockCount,
    period: { from: start.toISOString(), to: end.toISOString() },
  };
};