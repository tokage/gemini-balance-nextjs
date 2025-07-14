import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getKeyManager } from "@/lib/key-manager";
import { AddKeyDialog } from "./AddKeyDialog";
import { KeyTable } from "./KeyTable";

export const revalidate = 0; // Disable caching

export default async function AdminPage() {
  const keyManager = await getKeyManager();
  const keys = keyManager.getAllKeys();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage and monitor your Gemini API keys.
          </CardDescription>
        </div>
        <AddKeyDialog />
      </CardHeader>
      <CardContent>
        <KeyTable keys={keys} />
      </CardContent>
    </Card>
  );
}
