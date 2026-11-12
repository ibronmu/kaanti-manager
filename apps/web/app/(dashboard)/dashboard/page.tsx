"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, Receipt, PackageX } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatNaira } from "@/lib/format";
import { useCurrentBusiness } from "@/lib/business";
import { StatCard } from "@/components/dashboard/StatCard";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";

interface Summary {
  totalIncome: string;
  totalExpenses: string;
  netCashFlow: string;
  transactionCount: number;
  recentTransactions: Array<{
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: string;
    description: string;
    date: string;
    incomeCategory: { name: string } | null;
    expenseCategory: { name: string } | null;
  }>;
  monthlySeries: Array<{ month: string; income: number; expense: number }>;
  lowStockCount: number;
}

export default function DashboardPage() {
  const { business, loading: bizLoading, error: bizError } = useCurrentBusiness();
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!business) return;
    api.get<Summary>(`/businesses/${business.id}/dashboard`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load dashboard"));
  }, [business]);

  if (bizLoading) return <div className="card p-6 text-navy/60">Loading…</div>;
  if (bizError) return <div className="card p-6 text-red-700">{bizError}</div>;
  if (!business) return <div className="card p-6">No business found.</div>;
  if (error) return <div className="card p-6 text-red-700">{error}</div>;
  if (!data) return <div className="card p-6 text-navy/60">Loading dashboard…</div>;

  const isPositive = Number(data.netCashFlow) >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{business.name}</h1>
        <p className="text-sm text-navy/60">{business.location} · {business.category}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Income (this month)" value={formatNaira(data.totalIncome)} icon={TrendingUp} tone="positive" />
        <StatCard label="Expenses (this month)" value={formatNaira(data.totalExpenses)} icon={TrendingDown} tone="negative" />
        <StatCard label="Net cash flow" value={formatNaira(data.netCashFlow)} icon={Wallet} tone={isPositive ? "positive" : "negative"} />
        <StatCard label="Transactions" value={String(data.transactionCount)} icon={Receipt} />
      </div>

      {data.lowStockCount > 0 && (
        <div className="card flex items-center gap-3 border-gold/30 bg-gold/5 p-4">
          <PackageX className="text-gold" size={20} />
          <span className="text-sm text-navy">
            <strong>{data.lowStockCount}</strong> item(s) are low on stock.{" "}
            <Link href="/inventory" className="font-medium text-emerald">Review inventory →</Link>
          </span>
        </div>
      )}

      <div className="card p-4">
        <h2 className="mb-3 text-lg font-semibold text-navy">Income vs expenses</h2>
        <IncomeExpenseChart data={data.monthlySeries} />
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Recent transactions</h2>
          <Link href="/transactions" className="text-sm font-medium text-emerald">View all →</Link>
        </div>
        {data.recentTransactions.length === 0 ? (
          <p className="text-sm text-navy/60">No transactions yet. Record your first one.</p>
        ) : (
          <ul className="divide-y divide-navy/5">
            {data.recentTransactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-navy">{t.description}</p>
                  <p className="text-xs text-navy/60">
                    {t.incomeCategory?.name ?? t.expenseCategory?.name ?? "—"} · {formatDate(t.date)}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${t.type === "INCOME" ? "text-emerald" : "text-red-600"}`}>
                  {t.type === "INCOME" ? "+" : "−"}{formatNaira(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}