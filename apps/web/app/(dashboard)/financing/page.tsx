"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getLang, t } from "@/lib/i18n";

interface Partner { name: string; website: string | null }
interface FinancingProduct {
  id: string; name: string; structure: string; description: string;
  eligibility: string; terms: string; fees: string; isDemo: boolean; partner: Partner;
}

export default function FinancingPage() {
  const [products, setProducts] = useState<FinancingProduct[] | null>(null);
  const [structures, setStructures] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const lang = typeof window !== "undefined" ? getLang() : "en";

  useEffect(() => {
    Promise.all([
      api.get<FinancingProduct[]>("/financing"),
      api.get<string[]>("/financing/structures"),
    ])
      .then(([list, s]) => { setProducts(list); setStructures(s); })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  const filtered = products?.filter((p) => !filter || p.structure === filter) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{t("financing_title", lang)}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("financing_subtitle", lang)}</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <strong className="mr-2">{t("demo_banner", lang)}</strong>
        {t("financing_disclaimer", lang)}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`rounded-full px-3 py-1 text-xs font-medium ${!filter ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
          {t("financing_all", lang)}
        </button>
        {structures.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === s ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
            {s}
          </button>
        ))}
      </div>

      {error && <div className="card p-6 text-red-700">{error}</div>}
      {!filtered && !error && <div className="card p-6 text-slate-500">{t("loading", lang)}</div>}
      {filtered && filtered.length === 0 && <div className="card p-6 text-slate-500">{t("empty", lang)}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered?.map((p) => (
          <Link key={p.id} href={`/financing/${p.id}`} className="card p-5 transition hover:border-emerald-300">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-navy">{p.name}</h2>
                <p className="text-xs text-emerald-700">{p.structure}</p>
              </div>
              {p.isDemo && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">{t("demo_banner", lang)}</span>
              )}
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.description}</p>
            <p className="mt-3 text-xs text-slate-500">{p.partner.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}