"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, Lock, Mail, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "password" | "otp";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Two-step admin sign-in: email + password, then a 6-digit code sent to the
 * admin's email. A session exists only after the code is verified.
 */
export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [sentTo, setSentTo] = useState("");
  const [delivery, setDelivery] = useState<"email" | "console" | "unavailable">("email");
  const [expiresAt, setExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  // countdown tick while the code step is open
  useEffect(() => {
    if (step !== "otp") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step]);

  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  const backToPassword = (message?: string) => {
    setStep("password");
    setDigits(Array(6).fill(""));
    setError(message ?? null);
    setInfo(null);
  };

  const submitPassword = async (event?: React.FormEvent | React.MouseEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      sentTo?: string;
      delivery?: "email" | "console" | "unavailable";
      expiresInSeconds?: number;
    };
    setLoading(false);
    if (!response.ok || !data.ok) {
      setError(data.error || "Could not sign in.");
      return;
    }
    const t = Date.now();
    setSentTo(data.sentTo ?? "");
    setDelivery(data.delivery ?? "email");
    setExpiresAt(t + (data.expiresInSeconds ?? 300) * 1000);
    setResendAt(t + 30_000);
    setNow(t);
    setPassword("");
    setInfo(null);
    setStep("otp");
    setTimeout(() => boxes.current[0]?.focus(), 350);
  };

  const verify = async (code: string) => {
    if (code.length !== 6 || loading) return;
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; restart?: boolean };
    if (response.ok && data.ok) {
      setInfo("Verified — signing you in…");
      router.push("/admin");
      router.refresh();
      return;
    }
    setLoading(false);
    if (data.restart) {
      backToPassword(data.error || "Please sign in again.");
      return;
    }
    setError(data.error || "Incorrect code.");
    setDigits(Array(6).fill(""));
    setTimeout(() => boxes.current[0]?.focus(), 50);
  };

  const resend = async () => {
    setError(null);
    setInfo(null);
    const response = await fetch("/api/admin/login/resend", { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; restart?: boolean; expiresInSeconds?: number; waitSeconds?: number };
    if (response.ok && data.ok) {
      const t = Date.now();
      setExpiresAt(t + (data.expiresInSeconds ?? 300) * 1000);
      setResendAt(t + 30_000);
      setDigits(Array(6).fill(""));
      setInfo("A new code is on its way. The previous code no longer works.");
      boxes.current[0]?.focus();
      return;
    }
    if (data.restart) backToPassword(data.error);
    else {
      if (data.waitSeconds) setResendAt(Date.now() + data.waitSeconds * 1000);
      setError(data.error || "Could not send a new code.");
    }
  };

  const setDigit = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (clean.length > 1) {
      // pasted / autofilled the whole code
      const next = clean.slice(0, 6).padEnd(6, " ").split("").map((c) => c.trim());
      setDigits(next);
      const full = next.join("");
      if (full.length === 6) void verify(full);
      else boxes.current[Math.min(full.length, 5)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 5) boxes.current[index + 1]?.focus();
    const full = next.join("");
    if (full.length === 6) void verify(full);
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) boxes.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) boxes.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) boxes.current[index + 1]?.focus();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white p-6 shadow-2xl shadow-space/40">
      {/* step indicator */}
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className={step === "password" ? "text-brand-700" : "text-emerald-600"}>1. Password</span>
        <span className="h-px flex-1 bg-slate-200">
          <motion.span
            className="block h-px bg-brand-600"
            initial={false}
            animate={{ width: step === "otp" ? "100%" : "0%" }}
            transition={{ duration: 0.5 }}
          />
        </span>
        <span className={step === "otp" ? "text-brand-700" : ""}>2. Email code</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === "password" ? (
          <motion.form
            key="password"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            onSubmit={submitPassword}
            // No native submission: a submit before hydration would put the password in the URL.
            action={undefined}
            className="space-y-4"
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
                placeholder="you@yantrixtechnology.com"
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
            <Button type="submit" onClick={submitPassword} disabled={loading} className="btn-futur h-11 w-full rounded-xl text-sm font-bold text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              For your security, we&apos;ll email you a one-time code to finish signing in.
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-slate-900">Enter the 6-digit code</p>
                <p className="text-sm text-muted-foreground">
                  {delivery === "email" ? (
                    <>
                      We sent it to <strong className="text-slate-800">{sentTo}</strong>. Check spam too.
                    </>
                  ) : (
                    <>Email isn&apos;t configured yet — the code was printed in the server terminal.</>
                  )}
                </p>
              </div>
            </div>

            <fieldset className="flex justify-between gap-2" aria-label="One-time code">
              {digits.map((d, i) => (
                <motion.input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el;
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={i === 0 ? 6 : 1}
                  aria-label={`Digit ${i + 1}`}
                  value={d}
                  disabled={loading}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  className="h-14 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono text-2xl font-bold text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:opacity-60"
                />
              ))}
            </fieldset>

            <div className="flex items-center justify-between text-xs">
              <span className={secondsLeft > 60 ? "text-muted-foreground" : "font-semibold text-amber-600"}>
                {secondsLeft > 0 ? `Code expires in ${fmt(secondsLeft)}` : "Code expired — request a new one"}
              </span>
              <button
                type="button"
                onClick={resend}
                disabled={resendIn > 0 || loading}
                className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
              >
                <RotateCw className="h-3.5 w-3.5" />
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </div>

            {error ? (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
            {info ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{info}</p> : null}

            <Button
              type="button"
              onClick={() => verify(digits.join(""))}
              disabled={loading || digits.join("").length !== 6}
              className="btn-futur h-11 w-full rounded-xl text-sm font-bold text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Verify &amp; sign in
            </Button>
            <button
              type="button"
              onClick={() => backToPassword()}
              className="mx-auto flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Use a different account
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
