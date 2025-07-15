"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ParsedSettings } from "@/lib/settings";
import { useState, useTransition } from "react";
import { updateSettings } from "./actions";

interface ConfigFormProps {
  settings: ParsedSettings;
}

export function ConfigForm({ settings }: ConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  // Don't pre-fill the auth token for security reasons
  const [formData, setFormData] = useState<ParsedSettings>({
    ...settings,
    AUTH_TOKEN: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      // Convert numeric fields from string back to number if needed
      const dataToSave = {
        ...formData,
        MAX_FAILURES: Number(formData.MAX_FAILURES),
      };
      const result = await updateSettings(dataToSave);
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(result.success);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="AUTH_TOKEN">Auth Token</Label>
        <Input
          id="AUTH_TOKEN"
          type="password"
          value={formData.AUTH_TOKEN}
          onChange={handleInputChange}
          placeholder="Leave blank to keep current token"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ALLOWED_TOKENS">Allowed API Tokens</Label>
        <Input
          id="ALLOWED_TOKENS"
          value={formData.ALLOWED_TOKENS}
          onChange={handleInputChange}
          placeholder="Comma-separated list of allowed client tokens"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="MAX_FAILURES">Max Key Failures</Label>
        <Input
          id="MAX_FAILURES"
          type="number"
          value={formData.MAX_FAILURES}
          onChange={handleInputChange}
          placeholder="Number of failures before a key is deactivated"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="PROXY_URL">Upstream Proxy URL</Label>
        <Input
          id="PROXY_URL"
          value={formData.PROXY_URL}
          onChange={handleInputChange}
          placeholder="e.g., https://api.openai.com/v1"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="TOOLS_CODE_EXECUTION_ENABLED"
          checked={formData.TOOLS_CODE_EXECUTION_ENABLED}
          onCheckedChange={(checked) =>
            setFormData((p) => ({
              ...p,
              TOOLS_CODE_EXECUTION_ENABLED: checked,
            }))
          }
        />
        <Label htmlFor="TOOLS_CODE_EXECUTION_ENABLED">
          Enable Code Execution for Tools
        </Label>
      </div>
      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Saving..." : "Save Configuration"}
      </Button>
    </div>
  );
}
