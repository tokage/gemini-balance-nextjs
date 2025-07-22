import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "../../dictionaries";

export default async function LoginPage({
  params: { lang },
}: {
  params: { lang: "en" | "zh" };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{dict.loginPage.title}</CardTitle>
          <CardDescription>{dict.loginPage.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">{dict.loginPage.passwordLabel}</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">{dict.loginPage.signInButton}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
