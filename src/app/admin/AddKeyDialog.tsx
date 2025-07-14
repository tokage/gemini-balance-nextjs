"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { addApiKeys } from "./actions";

export function AddKeyDialog() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    startTransition(async () => {
      const result = await addApiKeys(keys);
      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(result.success);
        setOpen(false);
        setKeys("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add API Keys</DialogTitle>
          <DialogDescription>
            Paste one or more API keys below, one per line.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="keys" className="text-right">
              API Keys
            </Label>
            <Textarea
              id="keys"
              value={keys}
              onChange={(e) => setKeys(e.target.value)}
              className="col-span-3"
              placeholder="Enter one API key per line"
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Adding..." : "Add Keys"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
