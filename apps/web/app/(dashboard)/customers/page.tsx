"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { useCurrentBusiness } from "@/lib/business";

interface Customer { id: string; name: string; phone: string | null; email: string | null; balance: string; }

export default function CustomersPage() {
  const { business } = useCurrentBusiness();
  const [items, setItems] = useState<Customer[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const refresh = async () => {
    if (!business) return;
    try { setItems(await api.get<Customer[]>(`/businesses/${business.id}/customers`)); }
    catch (e) { setErr(e instanceof ApiError ? e.message : "Failed to load"); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [business]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!business) return;
    setErr(null);
    try {
      await api.post(`/businesses/${business.id}/customers`, {
        name: form.name, phone: form.phone || undefined, email: form.email || undefined,
      });
      setForm({ name: "", phone: "", email: "" });
      refresh();
    } catch (e) { setErr(e instanceof ApiError ? e.message : "Failed to save"); }
  };

  if (!business) return <div className="card p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Customers</h1>

      <form onSubmit={submit} className="card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <div><label className="label">Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
        <div><label className="label">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" /></div>
        <div><label className="label">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></div>
        <div className="flex items-end"><button className="btn-primary w-full">Add customer</button></div>
      </form>
      {err && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{err}</p>}

      <div className="card p-4">
        {!items ? <p className="text-sm text-navy/60">Loading…</p>
          : items.length === 0 ? <p className="text-sm text-navy/60">No customers yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy/10 text-left text-navy/60">
                    <th className="py-2">Name</th><th>Phone</th><th>Email</th><th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="border-b border-navy/5">
                      <td className="py-2">{c.name}</td>
                      <td>{c.phone ?? "—"}</td>
                      <td>{c.email ?? "—"}</td>
                      <td className="text-right">{formatNaira(c.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}