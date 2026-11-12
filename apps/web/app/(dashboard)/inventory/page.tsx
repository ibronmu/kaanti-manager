"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { useCurrentBusiness } from "@/lib/business";

interface Item {
  id: string; name: string; sku: string | null; quantity: number;
  costPrice: string; sellPrice: string; lowStock: number;
}

export default function InventoryPage() {
  const { business } = useCurrentBusiness();
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", quantity: 0, costPrice: 0, sellPrice: 0, lowStock: 5 });

  const refresh = async () => {
    if (!business) return;
    try { setItems(await api.get<Item[]>(`/businesses/${business.id}/inventory`)); }
    catch (e) { setErr(e instanceof ApiError ? e.message : "Failed to load"); }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [business]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!business) return;
    setErr(null);
    try {
      await api.post(`/businesses/${business.id}/inventory`, form);
      setForm({ name: "", quantity: 0, costPrice: 0, sellPrice: 0, lowStock: 5 });
      refresh();
    } catch (e) { setErr(e instanceof ApiError ? e.message : "Failed to save"); }
  };

  const remove = async (id: string) => {
    if (!business || !confirm("Delete this item?")) return;
    await api.patch(`/businesses/${business.id}/inventory/${id}`, { quantity: 0 }).catch(() => {});
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/businesses/${business.id}/inventory/${id}`, {
        method: "DELETE", credentials: "include",
      });
      refresh();
    } catch { /* ignore */ }
  };

  if (!business) return <div className="card p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Inventory</h1>

      <form onSubmit={submit} className="card grid grid-cols-1 gap-3 p-4 md:grid-cols-6">
        <div className="md:col-span-2">
          <label className="label">Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Quantity</label>
          <input type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="input" />
        </div>
        <div>
          <label className="label">Cost (₦)</label>
          <input type="number" min={0} step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} className="input" />
        </div>
        <div>
          <label className="label">Price (₦)</label>
          <input type="number" min={0} step="0.01" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })} className="input" />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full">Add item</button>
        </div>
      </form>
      {err && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{err}</p>}

      <div className="card p-4">
        {!items ? <p className="text-sm text-navy/60">Loading…</p>
          : items.length === 0 ? <p className="text-sm text-navy/60">No items yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy/10 text-left text-navy/60">
                    <th className="py-2">Name</th><th>Qty</th><th>Cost</th><th>Price</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-b border-navy/5">
                      <td className="py-2">{i.name}</td>
                      <td>{i.quantity}{i.quantity <= i.lowStock && <span className="ml-1 text-xs text-gold">low</span>}</td>
                      <td>{formatNaira(i.costPrice)}</td>
                      <td>{formatNaira(i.sellPrice)}</td>
                      <td className="text-right">
                        <button onClick={() => remove(i.id)} className="text-xs text-red-600">Delete</button>
                      </td>
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