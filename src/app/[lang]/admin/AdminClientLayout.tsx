"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dictionary } from "@/lib/dictionaries";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AdminClientLayout({
  children,
  dictionary,
  lang,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  lang: string;
}) {
  const pathname = usePathname();

  const getCurrentTab = () => {
    if (pathname === `/${lang}/admin/config`) return "config";
    if (pathname === `/${lang}/admin/logs`) return "logs";
    return "keys";
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        {/* This can be a global nav or breadcrumbs */}
        <div className="flex-1">{/* Potentially a search bar */}</div>
        <LanguageSwitcher />
      </header>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">
            {dictionary.dashboard.title}
          </h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <div className="grid gap-6">
            <Tabs value={getCurrentTab()} className="w-full">
              <TabsList>
                <Link href={`/${lang}/admin`} passHref>
                  <TabsTrigger value="keys">{dictionary.nav.keys}</TabsTrigger>
                </Link>
                <Link href={`/${lang}/admin/config`} passHref>
                  <TabsTrigger value="config">
                    {dictionary.nav.config}
                  </TabsTrigger>
                </Link>
                <Link href={`/${lang}/admin/logs`} passHref>
                  <TabsTrigger value="logs">{dictionary.nav.logs}</TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
