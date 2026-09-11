import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OgaBiz AI | Business management dashboard",
  description:
    "Track sales, stock, expenses, customers, debts, reports and profit from one simple business dashboard.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
