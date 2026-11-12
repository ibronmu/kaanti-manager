"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getLang, t, type Lang } from "@/lib/i18n";

interface Lesson {
  id: string; slug: string; category: string; order: number;
  durationMinutes: number; title: string; summary: string; language: string;
}

export default function LearnPage() {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const l = getLang();
    setLangState(l);
    Promise.all([
      api.get<Lesson[]>(`/education?lang=${l}`),
      api.get<string[]>("/education/categories"),
    ])
      .then(([list, cats]) => { setLessons(list); setCategories(cats); })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  const filtered = lessons?.filter((l) => !filter || l.category === filter) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{t("learn_title", lang)}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("learn_subtitle", lang)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`rounded-full px-3 py-1 text-xs font-medium ${!filter ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
          {t("learn_all", lang)}
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
        {filtered?.map((l) => (
          <Link key={l.id} href={`/learn/${l.slug}`} className="card p-5 transition hover:border-emerald-300">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-navy">{l.title}</h2>
                <p className="text-xs text-emerald-700">{l.category}</p>
              </div>
              <span className="text-xs text-slate-500">{l.durationMinutes} {t("learn_minutes", lang)}</span>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">{l.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}