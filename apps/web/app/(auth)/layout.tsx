import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-offwhite">
      <header className="mx-auto max-w-6xl px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald" />
          <span className="text-lg font-semibold text-navy">Kaanti Manager</span>
        </Link>
      </header>
      <section className="mx-auto max-w-md px-6 pb-16">{children}</section>
    </main>
  );
}