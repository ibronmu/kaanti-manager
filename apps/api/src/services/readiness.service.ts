import { prisma } from "../utils/prisma";

export const computeReadiness = async (businessId: string) => {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error("Business not found");

  const now = new Date();
  const monthsToCheck = 6;
  const windowStart = new Date(now.getFullYear(), now.getMonth() - (monthsToCheck - 1), 1);

  const transactions = await prisma.transaction.findMany({
    where: { businessId, date: { gte: windowStart } },
    select: { type: true, date: true },
  });

  const months = new Set(transactions.map((t) => `${t.date.getFullYear()}-${t.date.getMonth()}`));
  const hasIncome = transactions.some((t) => t.type === "INCOME");
  const hasExpense = transactions.some((t) => t.type === "EXPENSE");

  const businessAgeDays = Math.floor((now.getTime() - business.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  const indicators = [
    {
      key: "transactionConsistency",
      label: "Transaction record consistency",
      value: `${months.size} of the last ${monthsToCheck} months have at least one recorded transaction`,
      status: months.size >= 5 ? "good" : months.size >= 2 ? "partial" : "low",
    },
    {
      key: "incomeCompleteness",
      label: "Income records",
      value: hasIncome
        ? "At least one income transaction recorded in the last 6 months"
        : "No income transactions recorded in the last 6 months",
      status: hasIncome ? "good" : "low",
    },
    {
      key: "expenseCompleteness",
      label: "Expense records",
      value: hasExpense
        ? "At least one expense transaction recorded in the last 6 months"
        : "No expense transactions recorded in the last 6 months",
      status: hasExpense ? "good" : "low",
    },
    {
      key: "businessAge",
      label: "Business activity history",
      value: `${businessAgeDays} day${businessAgeDays === 1 ? "" : "s"} of continuous record keeping`,
      status: businessAgeDays >= 90 ? "good" : businessAgeDays >= 30 ? "partial" : "low",
    },
    {
      key: "reportAvailability",
      label: "Reports generated",
      value: await prisma.financialReport
        .count({ where: { businessId } })
        .then((n) => (n > 0 ? `${n} report${n === 1 ? "" : "s"} generated` : "No reports generated yet")),
      status: (await prisma.financialReport.count({ where: { businessId } })) > 0 ? "good" : "partial",
    },
  ];

  return {
    businessId,
    businessName: business.name,
    generatedAt: now.toISOString(),
    indicators,
    disclaimer:
      "This summary describes the quality and completeness of your business records. It is not a credit score and does not indicate financing approval. Financing assessments are made independently by authorised financial institutions.",
  };
};