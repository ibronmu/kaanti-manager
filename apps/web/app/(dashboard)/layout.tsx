"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Boxes, Users, FileText, Sparkles, TrendingUp, BookOpen, Activity, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getLang, setLang, t, type Lang } from "@/lib/i18n";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getLang());
    api.get("/businesses").catch(() => router.replace("/login"));
  }, [router]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } finally { router.replace("/login"); }
  };

  const nav = [
    { href: "/dashboard", label: t("nav_dashboard", lang), icon: LayoutDashboard },
    { href: "/transactions", label: t("nav_transactions", lang), icon: ArrowLeftRight },
    { href: "/inventory", label: t("nav_inventory", lang), icon: Boxes },
    { href: "/customers", label: t("nav_customers", lang), icon: Users },
    { href: "/reports", label: t("nav_reports", lang), icon: FileText },
    { href: "/financing", label: t("nav_financing", lang), icon: Sparkles },
    { href: "/investments", label: t("nav_investments", lang), icon: TrendingUp },
    { href: "/learn", label: t("nav_learn", lang), icon: BookOpen },
    { href: "/readiness", label: t("nav_readiness", lang), icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-offwhite md:flex">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-600" />
          <span className="text-lg font-semibold text-navy">Kaanti</span>
        </div>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <LogOut size={16} /> {t("nav_logout", lang)}
        </button>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <span className="text-sm font-medium text-slate-500">Kaanti Manager</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "ha" : "en")}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              title="Switch language"
            >
              {lang === "en" ? "HA" : "EN"}
            </button>
            <div className="h-8 w-8 rounded-full bg-navy" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}