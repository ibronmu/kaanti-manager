import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-offwhite">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald" />
          <span className="text-lg font-semibold text-navy">Kaanti Manager</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary">Log in</Link>
          <Link href="/register" className="btn-primary">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-bold text-navy md:text-5xl">
          Manage your business. <br /> Grow with clarity. Prosper with confidence.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy/70">
          Kaanti Manager helps Nigerian SMEs record sales and expenses, understand cash-flow,
          and discover suitable financial opportunities — built for real businesses.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/register" className="btn-primary">Create free account</Link>
          <Link href="/login" className="btn-secondary">I already have an account</Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-navy/60">
        © {new Date().getFullYear()} Kaanti Manager. Demonstration product — financial products shown are illustrative and offered by authorised partners only.
      </footer>
    </main>
  );
}