import { ConfigForm } from "@/app/admin/ConfigForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSettings } from "@/lib/settings";

export const revalidate = 0; // Disable caching

export default async function ConfigPage() {
  const settings = await getSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>
          Manage system-wide settings. Changes will be applied after saving.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ConfigForm settings={settings} />
      </CardContent>
    </Card>
  );
}
