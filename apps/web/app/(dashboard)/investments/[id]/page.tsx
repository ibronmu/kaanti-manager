"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { getLang, t } from "@/lib/i18n";

interface Partner { name: string; website: string | null }
interface InvestmentProduct {
  id: string; name: string; category: string; description: string;
  riskLevel: string; minAmount: string | null; isDemo: boolean; partner: Partner;
}

export default function InvestmentDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<InvestmentProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lang = typeof window !== "undefined" ? getLang() : "en";

  useEffect(() => {
    if (!params?.id) return;
    api.get<InvestmentProduct>(`/investments/${params.id}`)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [params?.id]);

  if (error) return <div className="card p-6 text-red-700">{error}</div>;
  if (!product) return <div className="card p-6 text-slate-500">{t("loading", lang)}</div>;

  const fmtNaira = (v: string | null) => v ? `₦${Number(v).toLocaleString("en-NG")}` : "—";

  return (
    <div className="space-y-6">
      <Link href="/investments" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-700">
        <ArrowLeft size={14} /> {t("nav_investments", lang)}
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-navy">{product.name}</h1>
            <p className="mt-1 text-sm text-emerald-700">{product.category} · {product.partner.name}</p>
          </div>
          {product.isDemo && <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{t("demo_banner", lang)}</span>}
        </div>

        <p className="mt-4 text-sm text-slate-700">{product.description}</p>

        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">{t("investments_risk", lang)}</dt>
            <dd className="mt-1 text-sm text-navy">{product.riskLevel}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">{t("investments_min", lang)}</dt>
            <dd className="mt-1 text-sm text-navy">{fmtNaira(product.minAmount)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        {t("investments_disclaimer", lang)}
      </div>
    </div>
  );
}