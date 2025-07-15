import { getSettings } from "@/lib/settings";
import bcrypt from "bcrypt";
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
  const { AUTH_TOKEN: storedAuthTokenHash } = await getSettings();

  let isAuthorized = false;
  if (tokenFromCookie && storedAuthTokenHash) {
    isAuthorized = await bcrypt.compare(tokenFromCookie, storedAuthTokenHash);
  }

  // If the cookie is missing, or if it's present but doesn't match the
  // hashed token in the database, redirect to the login page.
  if (!isAuthorized) {
    redirect("/");
  }

  // If validation passes, render the client layout and the page content.
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
