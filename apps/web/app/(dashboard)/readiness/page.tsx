"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getLang, t, type Lang } from "@/lib/i18n";

interface Business { id: string; name: string }
interface Indicator { key: string; label: string; value: string; status: "good" | "partial" | "low" }
interface Readiness {
  businessId: string; businessName: string; generatedAt: string;
  indicators: Indicator[]; disclaimer: string;
}

export default function ReadinessPage() {
  const [summary, setSummary] = useState<Readiness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getLang());
    api.get<Business[]>("/businesses")
      .then((biz) => {
        if (biz.length === 0) throw new Error("No business found");
        return api.get<Readiness>(`/readiness/${biz[0].id}`);
      })
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  const statusColor = (s: Indicator["status"]) =>
    s === "good" ? "bg-emerald-100 text-emerald-800" :
    s === "partial" ? "bg-amber-100 text-amber-800" :
    "bg-rose-100 text-rose-800";

  const statusLabel = (s: Indicator["status"]) =>
    s === "good" ? t("readiness_indicator_good", lang) :
    s === "partial" ? t("readiness_indicator_partial", lang) :
    t("readiness_indicator_low", lang);

  if (error) return <div className="card p-6 text-red-700">{error}</div>;
  if (!summary) return <div className="card p-6 text-slate-500">{t("loading", lang)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{t("readiness_title", lang)}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("readiness_subtitle", lang)}</p>
        <p className="mt-2 text-xs text-slate-500">{summary.businessName} · {new Date(summary.generatedAt).toLocaleDateString()}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {summary.indicators.map((ind) => (
          <div key={ind.key} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-navy">{ind.label}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(ind.status)}`}>{statusLabel(ind.status)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{ind.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {summary.disclaimer}
      </div>
    </div>
  );
}