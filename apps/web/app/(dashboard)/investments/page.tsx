"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getLang, t } from "@/lib/i18n";

interface Partner { name: string }
interface InvestmentProduct {
  id: string; name: string; category: string; description: string;
  riskLevel: string; minAmount: string | null; isDemo: boolean; partner: Partner;
}

export default function InvestmentsPage() {
  const [products, setProducts] = useState<InvestmentProduct[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const lang = typeof window !== "undefined" ? getLang() : "en";

  useEffect(() => {
    Promise.all([
      api.get<InvestmentProduct[]>("/investments"),
      api.get<string[]>("/investments/categories"),
    ])
      .then(([list, cats]) => { setProducts(list); setCategories(cats); })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  const filtered = products?.filter((p) => !filter || p.category === filter) ?? null;
  const fmtNaira = (v: string | null) => v ? `₦${Number(v).toLocaleString("en-NG")}` : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{t("investments_title", lang)}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("investments_subtitle", lang)}</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <strong className="mr-2">{t("demo_banner", lang)}</strong>
        {t("investments_disclaimer", lang)}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`rounded-full px-3 py-1 text-xs font-medium ${!filter ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
          {t("financing_all", lang)}
        </button>
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === c ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {error && <div className="card p-6 text-red-700">{error}</div>}
      {!filtered && !error && <div className="card p-6 text-slate-500">{t("loading", lang)}</div>}
      {filtered && filtered.length === 0 && <div className="card p-6 text-slate-500">{t("empty", lang)}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered?.map((p) => (
          <Link key={p.id} href={`/investments/${p.id}`} className="card p-5 transition hover:border-emerald-300">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-navy">{p.name}</h2>
                <p className="text-xs text-emerald-700">{p.category}</p>
              </div>
              {p.isDemo && <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">{t("demo_banner", lang)}</span>}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.description}</p>
            <p className="mt-3 text-xs text-slate-500">{p.partner.name}</p>
            <p className="mt-1 text-xs text-slate-500">{t("investments_min", lang)}: {fmtNaira(p.minAmount)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}