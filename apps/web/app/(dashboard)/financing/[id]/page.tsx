"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { getLang, t } from "@/lib/i18n";

interface Partner { name: string; website: string | null; contact?: string | null }
interface FinancingProduct {
  id: string; name: string; structure: string; description: string;
  eligibility: string; terms: string; fees: string; isDemo: boolean; partner: Partner;
}

export default function FinancingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<FinancingProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interestResult, setInterestResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lang = typeof window !== "undefined" ? getLang() : "en";

  useEffect(() => {
    if (!params?.id) return;
    api.get<FinancingProduct>(`/financing/${params.id}`)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [params?.id]);

  const expressInterest = async () => {
    setSubmitting(true);
    try {
      const res = await api.post<{ message: string; providerNote: string }>(`/financing/${params.id}/interest`);
      setInterestResult(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div className="card p-6 text-red-700">{error}</div>;
  if (!product) return <div className="card p-6 text-slate-500">{t("loading", lang)}</div>;

  return (
    <div className="space-y-6">
      <Link href="/financing" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-700">
        <ArrowLeft size={14} /> {t("nav_financing", lang)}
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-navy">{product.name}</h1>
            <p className="mt-1 text-sm text-emerald-700">{product.structure} · {product.partner.name}</p>
          </div>
          {product.isDemo && <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{t("demo_banner", lang)}</span>}
        </div>

        <p className="mt-4 text-sm text-slate-700">{product.description}</p>

        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">{t("financing_eligibility", lang)}</dt>
            <dd className="mt-1 text-sm text-navy">{product.eligibility}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">{t("financing_terms", lang)}</dt>
            <dd className="mt-1 text-sm text-navy">{product.terms}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">{t("financing_fees", lang)}</dt>
            <dd className="mt-1 text-sm text-navy">{product.fees}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">{t("financing_provider", lang)}</dt>
            <dd className="mt-1 text-sm text-navy">
              {product.partner.name}
              {product.partner.website && (
                <a href={product.partner.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-emerald-700 underline">↗</a>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-slate-100 pt-4">
          {interestResult ? (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{interestResult}</p>
          ) : (
            <button onClick={expressInterest} disabled={submitting} className="btn-primary">
              {submitting ? t("loading", lang) : t("financing_express", lang)}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        {t("financing_disclaimer", lang)}
      </div>
    </div>
  );
}