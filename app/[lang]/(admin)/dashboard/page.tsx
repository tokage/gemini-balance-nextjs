import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function checkAuth(lang: "en" | "zh") {
  const tokenFromCookie = (await cookies()).get("auth_token")?.value;

  if (!tokenFromCookie) {
    redirect(`/${lang}/login`);
  }

  try {
    const tokenFromDb = await db.query.settings.findFirst({
      where: eq(settings.key, "AUTH_TOKEN"),
    });

    if (!tokenFromDb || tokenFromCookie !== tokenFromDb.value) {
      redirect(`/${lang}/login`);
    }
  } catch (error) {
    console.error("Dashboard Auth Error:", error);
    redirect(`/${lang}/login`);
  }
}

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: "en" | "zh" };
}) {
  await checkAuth(lang);

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>You are authenticated!</p>
    </div>
  );
}
