import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { getServerLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Milrumos — Collaborative Writing",
  description: "Write, branch, build on each other's work.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
