import { LucideIcon } from "lucide-react";

export const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "negative";
}) => {
  const color =
    tone === "positive" ? "text-emerald" : tone === "negative" ? "text-red-600" : "text-navy";
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy/60">{label}</p>
        <Icon size={16} className="text-navy/40" />
      </div>
      <p className={`mt-2 text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
};