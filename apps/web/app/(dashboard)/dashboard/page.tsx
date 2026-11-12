"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { Business } from "@/app/lib/session";

export default function DashboardPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Business[]>("/businesses")
      .then((list) => {
        if (list.length === 0) router.replace("/onboarding");
        else setBusinesses(list);
      })
      .catch((e) => setError(e.message));
  }, [router]);

  if (error) return <div className="card p-6 text-red-700">{error}</div>;
  if (!businesses) return <div className="card p-6 text-navy/60">Loading dashboard…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Welcome back 👋</h1>
        <p className="text-sm text-navy/60">
          Managing <span className="font-medium">{businesses[0].name}</span> — {businesses[0].location}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total income", value: "₦0.00" },
          { label: "Total expenses", value: "₦0.00" },
          { label: "Net cash flow", value: "₦0.00" },
          { label: "Transactions", value: "0" },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-sm text-navy/60">{k.label}</p>
            <p className="mt-1 text-xl font-semibold text-navy">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-navy">Phase 1 complete</h2>
        <p className="mt-2 text-sm text-navy/70">
          Your account and business are set up. Income and expense tracking, inventory,
          customers and reports arrive in Phase 2.
        </p>
      </div>
    </div>
  );
}