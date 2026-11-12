"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { monthLabel } from "@/lib/format";

interface Point { month: string; income: number; expense: number; }

export const IncomeExpenseChart = ({ data }: { data: Point[] }) => {
  const chartData = data.map((d) => ({ ...d, monthLabel: monthLabel(d.month) }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v as number / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#0F8F5D" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#DC2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};