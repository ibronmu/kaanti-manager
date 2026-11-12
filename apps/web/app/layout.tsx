import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kaanti Manager — Manage. Grow. Prosper.",
  description: "Modern SME financial management and financial inclusion platform for Nigerian businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}