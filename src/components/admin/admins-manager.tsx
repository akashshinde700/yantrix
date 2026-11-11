"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2, Plus, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { AdminRole, PublicAdmin } from "@/lib/content/types";

/** Password input with a show/hide toggle, so a typo is visible before saving. */
function PasswordInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        required
        minLength={8}
        autoComplete="new-password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-900"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function AdminsManager({
  admins,
  currentAdminId,
  isOwner,
}: {
  admins: PublicAdmin[];
  currentAdminId: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [resetFor, setResetFor] = useState<PublicAdmin | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor" as AdminRole,
  });

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("new");
    const response = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    setBusy(null);
    if (!response.ok || !data.ok) {
      toast({
        variant: "destructive",
        title: "Not created",
        description: data.error,
      });
      return;
    }
    setOpen(false);
    setForm({ name: "", email: "", password: "", role: "editor" });
    toast({ title: "Admin account created" });
    router.refresh();
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusy(id);
    const response = await fetch(`/api/admin/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    setBusy(null);
    if (!response.ok || !data.ok) {
      toast({
        variant: "destructive",
        title: "Not saved",
        description: data.error,
      });
      return;
    }
    toast({ title: "Account updated" });
    router.refresh();
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetFor) return;
    setBusy(resetFor.id);
    const response = await fetch(`/api/admin/admins/${resetFor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setBusy(null);
    if (!response.ok || !data.ok) {
      toast({ variant: "destructive", title: "Password not changed", description: data.error });
      return;
    }
    toast({
      title: "Password changed",
      description: `${resetFor.email} can now sign in with the new password. Any open sessions were signed out.`,
    });
    setResetFor(null);
    setNewPassword("");
    router.refresh();
  };

  const remove = async (admin: PublicAdmin) => {
    if (!window.confirm(`Remove ${admin.email}?`)) return;
    setBusy(admin.id);
    const response = await fetch(`/api/admin/admins/${admin.id}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (!response.ok) {
      toast({ variant: "destructive", title: "Could not remove account" });
      return;
    }
    toast({ title: "Account removed" });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {isOwner ? (
        <div className="flex justify-end">
          <Button
            onClick={() => setOpen(true)}
            className="h-9 rounded-lg font-bold"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add admin
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Account</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                Last login
              </th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Access</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-4 py-3">
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    {admin.name}
                    {admin.id === currentAdminId ? (
                      <Badge variant="secondary" className="text-[10px]">
                        You
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">{admin.email}</p>
                </td>
                <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">
                  {admin.lastLoginAt
                    ? // fixed locale + zone: server and browser must render the same text
                      new Date(admin.lastLoginAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                    : "Never"}
                </td>
                <td className="px-4 py-3">
                  {isOwner ? (
                    <Select
                      value={admin.role}
                      onValueChange={(value) =>
                        patch(admin.id, { role: value })
                      }
                    >
                      <SelectTrigger
                        aria-label={`Role for ${admin.name}`}
                        className="h-8 w-28 text-xs font-semibold capitalize"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="capitalize">{admin.role}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => patch(admin.id, { active: !admin.active })}
                    disabled={busy === admin.id || admin.id === currentAdminId}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                      admin.active
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-slate-100 text-slate-500 ring-slate-200"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {admin.active ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  {isOwner && admin.id !== currentAdminId ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-600"
                      onClick={() => {
                        setNewPassword("");
                        setResetFor(admin);
                      }}
                      aria-label={`Reset password for ${admin.email}`}
                      title="Reset password"
                      disabled={busy === admin.id}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {isOwner && admin.id !== currentAdminId ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(admin)}
                      aria-label="Remove admin"
                      disabled={busy === admin.id}
                    >
                      {busy === admin.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-4 w-4" /> Add an admin
            </DialogTitle>
            <DialogDescription>
              Editors can change content. Owners can also manage admin accounts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Temporary password</Label>
              <PasswordInput
                id="admin-password"
                value={form.password}
                onChange={(password) => setForm({ ...form, password })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm({ ...form, role: value as AdminRole })
                }
              >
                <SelectTrigger aria-label="Role for the new admin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={busy === "new"}
              className="w-full font-bold"
            >
              {busy === "new" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create account
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={resetFor !== null} onOpenChange={(next) => (next ? null : setResetFor(null))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Reset password
            </DialogTitle>
            <DialogDescription>
              Set a new password for {resetFor?.email}. They will be signed out everywhere and
              sign in again with this password (and the emailed code).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New password (min. 8 characters)</Label>
              <PasswordInput id="reset-password" value={newPassword} onChange={setNewPassword} />
            </div>
            <Button
              type="submit"
              disabled={busy === resetFor?.id || newPassword.length < 8}
              className="w-full font-bold"
            >
              {busy === resetFor?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save new password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
