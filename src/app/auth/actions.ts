"use server";

import { getSettings, updateSetting } from "@/lib/settings";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SALT_ROUNDS = 10;

export async function login(
  state: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const submittedToken = (formData.get("token") as string) || "";
  const settings = await getSettings();
  const storedAuthTokenHash = settings.AUTH_TOKEN;

  if (submittedToken === "") {
    return { error: "Token cannot be empty." };
  }

  // Case 1: System is already configured with a hashed token.
  if (storedAuthTokenHash) {
    const isValid = await bcrypt.compare(submittedToken, storedAuthTokenHash);
    if (!isValid) {
      return { error: "Invalid token." };
    }
  }
  // Case 2: Initial setup. The first submitted token sets the new hash.
  else {
    const newHash = await bcrypt.hash(submittedToken, SALT_ROUNDS);
    await updateSetting("AUTH_TOKEN", newHash);
  }

  // If we reach here, login is successful.
  // Store the raw token in the cookie for subsequent requests validation.
  const cookieStore = await cookies();
  cookieStore.set("auth_token", submittedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/");
}
