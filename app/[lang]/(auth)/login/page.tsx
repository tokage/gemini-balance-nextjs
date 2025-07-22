import { getDictionary } from "../../dictionaries";
import { createLoginAction } from "../actions";
import { LoginForm } from "../login-form";

export default async function LoginPage({
  params: { lang },
}: {
  params: { lang: "en" | "zh" };
}) {
  const dict = await getDictionary(lang);
  const loginAction = createLoginAction(lang);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <LoginForm action={loginAction} dict={dict} />
    </div>
  );
}
