import { prisma } from "../utils/prisma";

const escapeCsv = (v: string) => `"${v.replace(/"/g, '""')}"`;

export const transactionsCsv = async (
  businessId: string,
  from: Date,
  to: Date
) => {
  const rows = await prisma.transaction.findMany({
    where: { businessId, date: { gte: from, lte: to } },
    include: { incomeCategory: true, expenseCategory: true, customer: true },
    orderBy: { date: "asc" },
  });

  const header = ["Date", "Type", "Category", "Customer", "Description", "Amount (NGN)"];
  const lines = [header.join(",")];

  for (const t of rows) {
    const category = t.incomeCategory?.name ?? t.expenseCategory?.name ?? "";
    lines.push([
      t.date.toISOString().slice(0, 10),
      t.type,
      escapeCsv(category),
      escapeCsv(t.customer?.name ?? ""),
      escapeCsv(t.description),
      Number(t.amount).toFixed(2),
    ].join(","));
  }

  // Record a FinancialReport audit row so we know what was exported and when.
  await prisma.financialReport.create({
    data: {
      businessId,
      title: "Transactions export",
      periodStart: from,
      periodEnd: to,
      format: "CSV",
      metadata: { rowCount: rows.length },
    },
  });

  return lines.join("\n");
};