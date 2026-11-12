export const formatNaira = (v: string | number) => {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return "₦0.00";
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "2-digit" });

export const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-NG", { month: "short", year: "2-digit" });
};