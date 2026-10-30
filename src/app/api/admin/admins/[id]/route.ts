import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  getSessionAdmin,
  hashPassword,
  isOwner,
  publicAdmin,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin/auth";
import { addAuditEntry, deleteAdmin, getAdmins, updateAdmin } from "@/lib/content/store";
import type { AdminPatch } from "@/lib/content/types";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  role: z.enum(["owner", "editor", "viewer"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  const { id } = await params;

  if (!isOwner(admin.role) && admin.id !== id) {
    return NextResponse.json(
      { ok: false, error: "You can only edit your own account." },
      { status: 403 }
    );
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 422 }
    );
  }

  const target = (await getAdmins()).find((a) => a.id === id);
  if (!target) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  const input = parsed.data;
  const patch: AdminPatch = {
    name: input.name ?? target.name,
    // Non-owners may only change their own name/password.
    role: isOwner(admin.role) ? (input.role ?? target.role) : target.role,
    active: isOwner(admin.role) ? (input.active ?? target.active) : target.active,
    passwordHash: input.password ? hashPassword(input.password) : target.passwordHash,
  };

  // Changing the password or deactivating the account must invalidate tokens
  // already issued for it — otherwise a stolen session outlives the reset.
  const credentialsChanged =
    Boolean(input.password) || (patch.active === false && target.active === true);
  if (credentialsChanged) patch.sessionVersion = (target.sessionVersion ?? 0) + 1;

  const updated = await updateAdmin(id, patch);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  await addAuditEntry({ actorEmail: admin.email, action: "updateAdmin", target: target.email });

  const response = NextResponse.json({ ok: true, admin: publicAdmin(updated) });

  // If you changed your own password, hand back a fresh cookie so you are not
  // signed out of the tab you are using.
  if (credentialsChanged && admin.id === id && updated.active) {
    response.cookies.set(SESSION_COOKIE, createSessionToken(updated), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }
  return response;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  if (!isOwner(admin.role)) {
    return NextResponse.json({ ok: false, error: "Only the owner can remove admins." }, { status: 403 });
  }
  const { id } = await params;
  if (id === admin.id) {
    return NextResponse.json({ ok: false, error: "You cannot delete your own account." }, { status: 400 });
  }
  const target = (await getAdmins()).find((a) => a.id === id);
  if (!target) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }
  await deleteAdmin(id);
  await addAuditEntry({ actorEmail: admin.email, action: "deleteAdmin", target: target.email });
  return NextResponse.json({ ok: true });
}
