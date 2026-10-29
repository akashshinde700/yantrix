"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { adminPost } from "@/components/admin/api";

export function ChangePasswordForm({ adminId }: { adminId: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Use at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    setLoading(true);
    const response = await fetch(`/api/admin/admins/${adminId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setLoading(false);
    if (!response.ok || !data.ok) {
      toast({ variant: "destructive", title: "Not saved", description: data.error });
      return;
    }
    setPassword("");
    setConfirm("");
    toast({ title: "Password updated" });
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="h-10 rounded-lg font-bold">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
        Update password
      </Button>
    </form>
  );
}

export function ResetContentButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const reset = async () => {
    if (
      !window.confirm(
        "Reset all website content to the original defaults? Your edits, added courses and FAQs will be replaced. Enquiries are not affected."
      )
    ) {
      return;
    }
    setLoading(true);
    const result = await adminPost({ op: "reset" });
    setLoading(false);
    if (!result.ok) {
      toast({ variant: "destructive", title: "Could not reset", description: result.error });
      return;
    }
    toast({ title: "Content reset to defaults" });
    router.refresh();
  };

  return (
    <Button variant="destructive" onClick={reset} disabled={loading} className="h-10 rounded-lg font-bold">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
      Reset all content
    </Button>
  );
}
