"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setLoading(false);
    if (!response.ok || !data.ok) {
      setError(data.error || "Could not sign in.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-white/10 bg-white p-6 shadow-2xl shadow-space/40"
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4 text-brand-600" /> Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@yantrixtechnology.com"
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold">
          <Lock className="h-4 w-4 text-brand-600" /> Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="h-11"
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="btn-futur h-11 w-full rounded-xl text-sm font-bold text-white"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign in
      </Button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Default first-time login: <strong>admin@yantrixtechnology.com</strong> /{" "}
        <strong>Yantrix@2024</strong>. Change it from Site settings after signing in.
      </p>
    </form>
  );
}
