"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getCurrentTab = () => {
    if (pathname === "/admin/config") return "config";
    if (pathname === "/admin/logs") return "logs";
    return "keys";
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <div className="grid gap-6">
            <Tabs value={getCurrentTab()} className="w-full">
              <TabsList>
                <Link href="/admin" passHref>
                  <TabsTrigger value="keys">Keys</TabsTrigger>
                </Link>
                <Link href="/admin/config" passHref>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                </Link>
                <Link href="/admin/logs" passHref>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
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
