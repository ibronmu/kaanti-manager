"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Boxes, Users, FileText, Sparkles, TrendingUp, BookOpen, LogOut } from "lucide-react";
import { api } from "@/app/lib/api";
import { useEffect } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/financing", label: "Financing", icon: Sparkles },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/learn", label: "Kaanti Learn", icon: BookOpen },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Client-side guard: if /businesses returns 401, redirect to login.
  useEffect(() => {
    api.get("/businesses").catch(() => router.replace("/login"));
  }, [router]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } finally { router.replace("/login"); }
  };

  return (
    <div className="min-h-screen bg-offwhite md:flex">
      <aside className="hidden w-64 flex-col border-r border-navy/10 bg-white p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="h-9 w-9 rounded-xl bg-emerald" />
          <span className="text-lg font-semibold text-navy">Kaanti</span>
        </div>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-emerald/10 text-emerald" : "text-navy/70 hover:bg-navy-50"
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy/70 hover:bg-navy-50">
          <LogOut size={16} /> Log out
        </button>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-navy/10 bg-white px-4 py-3 md:px-6">
          <span className="text-sm font-medium text-navy/70">Kaanti Manager</span>
          <div className="h-8 w-8 rounded-full bg-navy" />
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}