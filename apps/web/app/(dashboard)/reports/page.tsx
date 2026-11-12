"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useCurrentBusiness } from "@/lib/business";

export default function ReportsPage() {
  const { business } = useCurrentBusiness();
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const download = async () => {
    if (!business) return;
    setBusy(true); setErr(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/businesses/${business.id}/reports/transactions.csv?from=${from}&to=${to}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new ApiError(res.status, "Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `transactions-${from}-to-${to}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Download failed");
    } finally { setBusy(false); }
  };

  if (!business) return <div className="card p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Reports</h1>

      <div className="card p-4">
        <h2 className="mb-3 text-lg font-semibold text-navy">Transactions export (CSV)</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div><label className="label">From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" /></div>
          <div><label className="label">To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" /></div>
          <div className="flex items-end"><button onClick={download} disabled={busy} className="btn-primary w-full">{busy ? "Preparing…" : "Download CSV"}</button></div>
        </div>
        {err && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{err}</p>}
        <p className="mt-3 text-xs text-navy/50">
          These are bookkeeping reports based on your recorded transactions — not audited financial statements.
        </p>
      </div>
    </div>
  );
}