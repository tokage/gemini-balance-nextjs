"use server";

import { getSettings, updateSetting } from "@/lib/settings";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  state: { error?: string; success?: boolean },
  formData: FormData
) {
  const submittedToken = (formData.get("token") as string) || "";
  const settings = await getSettings();
  const currentAuthToken = settings.AUTH_TOKEN;

  // Rule: The token can never be empty.
  if (submittedToken === "") {
    return { error: "Token cannot be empty." };
  }

  // Case 1: System is already configured.
  if (currentAuthToken !== "") {
    if (submittedToken !== currentAuthToken) {
      return { error: "Invalid token." };
    }
  }
  // Case 2: Initial setup (currentAuthToken is "").
  else {
    // The first non-empty token becomes the new auth token.
    await updateSetting("AUTH_TOKEN", submittedToken);
  }

  // If we reach here, login is successful.
  const cookieStore = await cookies();
  cookieStore.set("auth_token", submittedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/auth");
}
