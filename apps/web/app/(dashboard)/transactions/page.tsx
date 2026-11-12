"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatNaira } from "@/lib/format";
import { useCurrentBusiness } from "@/lib/business";

interface Category { id: string; name: string; }
interface Categories { income: Category[]; expense: Category[]; }
interface Txn {
  id: string; type: "INCOME" | "EXPENSE"; amount: string; description: string; date: string;
  incomeCategory: Category | null; expenseCategory: Category | null;
}
interface ListResponse { items: Txn[]; total: number; page: number; pageSize: number; }

const schema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description required"),
  date: z.string().min(1, "Date required"),
  categoryId: z.string().uuid("Select a category"),
});
type FormValues = z.infer<typeof schema>;

export default function TransactionsPage() {
  const { business, loading: bizLoading } = useCurrentBusiness();
  const [categories, setCategories] = useState<Categories>({ income: [], expense: [] });
  const [list, setList] = useState<ListResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"" | "INCOME" | "EXPENSE">("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "INCOME",
      amount: 0,
      description: "",
      date: new Date().toISOString().slice(0, 10),
      categoryId: "",
    },
  });
  const type = form.watch("type");
  const available = type === "INCOME" ? categories.income : categories.expense;

  const refresh = async () => {
    if (!business) return;
    setErr(null);
    const qs = filterType ? `?type=${filterType}` : "";
    try {
      const res = await api.get<ListResponse>(`/businesses/${business.id}/transactions${qs}`);
      setList(res);
    } catch (e) { setErr(e instanceof ApiError ? e.message : "Failed to load"); }
  };

  useEffect(() => {
    if (!business) return;
    api.get<Categories>(`/businesses/${business.id}/transactions/categories`).then((c) => {
      setCategories(c);
      if (!form.getValues("categoryId") && c.income[0]) form.setValue("categoryId", c.income[0].id);
    });
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filterType]);

  // Reset category when type toggles
  useEffect(() => {
    const listForType = type === "INCOME" ? categories.income : categories.expense;
    form.setValue("categoryId", listForType[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const onSubmit = async (v: FormValues) => {
    if (!business) return;
    setErr(null);
    try {
      await api.post(`/businesses/${business.id}/transactions`, {
        ...v,
        date: new Date(v.date).toISOString(),
      });
      form.reset({
        type: v.type, amount: 0, description: "",
        date: new Date().toISOString().slice(0, 10),
        categoryId: v.categoryId,
      });
      refresh();
    } catch (e) { setErr(e instanceof ApiError ? e.message : "Failed to save"); }
  };

  if (bizLoading) return <div className="card p-6 text-navy/60">Loading…</div>;
  if (!business) return <div className="card p-6">No business found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Transactions</h1>

      <div className="card p-4">
        <h2 className="mb-3 text-lg font-semibold text-navy">Record a transaction</h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="md:col-span-1">
            <label className="label">Type</label>
            <select {...form.register("type")} className="input">
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="label">Amount (₦)</label>
            <input type="number" step="0.01" {...form.register("amount")} className="input" />
            {form.formState.errors.amount && <p className="mt-1 text-xs text-red-600">{form.formState.errors.amount.message}</p>}
          </div>
          <div className="md:col-span-1">
            <label className="label">Date</label>
            <input type="date" {...form.register("date")} className="input" />
          </div>
          <div className="md:col-span-1">
            <label className="label">Category</label>
            <select {...form.register("categoryId")} className="input">
              {available.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="label">Description</label>
            <input {...form.register("description")} className="input" placeholder="e.g. Sale to Musa" />
          </div>
          <div className="flex items-end md:col-span-1">
            <button type="submit" disabled={form.formState.isSubmitting} className="btn-primary w-full">
              {form.formState.isSubmitting ? "Saving…" : "Add"}
            </button>
          </div>
        </form>
        {err && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{err}</p>}
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">History</h2>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="input max-w-[160px]">
            <option value="">All</option>
            <option value="INCOME">Income only</option>
            <option value="EXPENSE">Expense only</option>
          </select>
        </div>
        {!list ? <p className="text-sm text-navy/60">Loading…</p>
          : list.items.length === 0 ? <p className="text-sm text-navy/60">No transactions yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy/10 text-left text-navy/60">
                    <th className="py-2">Date</th><th>Description</th><th>Category</th>
                    <th>Type</th><th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {list.items.map((t) => (
                    <tr key={t.id} className="border-b border-navy/5">
                      <td className="py-2">{formatDate(t.date)}</td>
                      <td>{t.description}</td>
                      <td>{t.incomeCategory?.name ?? t.expenseCategory?.name ?? "—"}</td>
                      <td>{t.type === "INCOME" ? "Income" : "Expense"}</td>
                      <td className={`text-right font-medium ${t.type === "INCOME" ? "text-emerald" : "text-red-600"}`}>
                        {formatNaira(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-navy/50">{list.total} total · page {list.page}</p>
            </div>
          )}
      </div>
    </div>
  );
}