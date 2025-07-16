import { i18n } from "@/i18n-config";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "../globals.css";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: "Gemini Balance - High-Performance AI Gateway",
  description:
    "A Next.js implementation of the Gemini Balance project, serving as an intelligent AI gateway.",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { children, params: paramsPromise } = props;
  const params = await paramsPromise;
  return (
    <html
      lang={params.lang}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
