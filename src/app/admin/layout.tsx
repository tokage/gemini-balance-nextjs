import { getSettings } from "@/lib/settings";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClientLayout from "./AdminClientLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a server component, so we can safely access the database here.
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get("auth_token")?.value;
  const { AUTH_TOKEN } = await getSettings();

  // If the cookie is missing, or if it's present but doesn't match the
  // token in the database, redirect to the auth page.
  if (!tokenFromCookie || tokenFromCookie !== AUTH_TOKEN || !AUTH_TOKEN) {
    redirect("/auth");
  }

  // If validation passes, render the client layout and the page content.
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
