import { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import LoginForm from "./LoginForm";

export default async function Home({
  params: paramsPromise,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await paramsPromise;
  const dictionary = await getDictionary(params.lang);
  return <LoginForm dictionary={dictionary.loginForm} />;
}
