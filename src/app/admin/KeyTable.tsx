"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { useTransition } from "react";
import { deleteApiKeys, resetKeysFailures, verifyApiKeys } from "./actions";

type Key = {
  key: string;
  failCount: number;
  isWorking: boolean;
  lastFailedAt: Date | null;
};

interface KeyTableProps {
  keys: Key[];
}

export function KeyTable({ keys }: KeyTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (key: string) => {
    if (
      confirm(
        `Are you sure you want to delete the key ending in ...${key.slice(-4)}?`
      )
    ) {
      startTransition(async () => {
        const result = await deleteApiKeys([key]);
        if (result.error) alert(`Error: ${result.error}`);
        else alert(result.success);
      });
    }
  };

  const handleReset = (key: string) => {
    startTransition(async () => {
      const result = await resetKeysFailures([key]);
      if (result.error) alert(`Error: ${result.error}`);
      else alert(result.success);
    });
  };

  const handleVerify = (key: string) => {
    startTransition(async () => {
      const result = await verifyApiKeys([key]);
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        const keyResult = result.results?.[0];
        if (keyResult) {
          alert(
            `Verification for key ...${keyResult.key.slice(-4)}: ${
              keyResult.success ? "Success" : "Failed"
            }`
          );
        } else {
          alert(result.success);
        }
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key (Last 4 Chars)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Failure Count</TableHead>
          <TableHead>Last Failed At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.key}>
            <TableCell>...{key.key.slice(-4)}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  key.isWorking
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {key.isWorking ? "Active" : "Inactive"}
              </span>
            </TableCell>
            <TableCell>{key.failCount}</TableCell>
            <TableCell>
              {key.lastFailedAt
                ? new Date(key.lastFailedAt).toLocaleString()
                : "N/A"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleVerify(key.key)}
                    disabled={isPending}
                  >
                    Verify Key
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleReset(key.key)}
                    disabled={isPending}
                  >
                    Reset Failures
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(key.key)}
                    disabled={isPending}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
