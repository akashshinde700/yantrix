"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sends both enquiry emails (sample data) to the signed-in admin. */
export function EmailTestButton({ disabled }: { disabled?: boolean }) {
  const [state, setState] = useState<{ busy: boolean; msg?: string; ok?: boolean }>({ busy: false });
  const send = async () => {
    setState({ busy: true });
    const res = await fetch("/api/admin/email-test", { method: "POST" });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; to?: string; error?: string };
    setState({ busy: false, ok: Boolean(json.ok), msg: json.ok ? `Sent both emails to ${json.to} — check your inbox (and spam).` : json.error || "Sending failed." });
  };
  return (
    <div className="space-y-2">
      <Button type="button" onClick={send} disabled={disabled || state.busy}>
        {state.busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Send test emails to me
      </Button>
      {state.msg ? <p className={state.ok ? "text-sm font-medium text-emerald-700" : "text-sm font-medium text-red-600"}>{state.msg}</p> : null}
    </div>
  );
}
