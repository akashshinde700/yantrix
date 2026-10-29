import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionAdmin, hashPassword, isOwner, publicAdmin } from "@/lib/admin/auth";
import { addAuditEntry, getAdmins, saveAdmins } from "@/lib/content/store";

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

  const admins = await getAdmins();
  const target = admins.find((a) => a.id === id);
  if (!target) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  const patch = parsed.data;
  if (!isOwner(admin.role)) {
    // Non-owners may only change their own name/password
    patch.role = undefined;
    patch.active = undefined;
  }

  const updated = admins.map((account) =>
    account.id === id
      ? {
          ...account,
          name: patch.name ?? account.name,
          role: patch.role ?? account.role,
          active: patch.active ?? account.active,
          passwordHash: patch.password ? hashPassword(patch.password) : account.passwordHash,
        }
      : account
  );
  await saveAdmins(updated);
  await addAuditEntry({ actorEmail: admin.email, action: "updateAdmin", target: target.email });
  return NextResponse.json({
    ok: true,
    admin: publicAdmin(updated.find((a) => a.id === id)!),
  });
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
  const admins = await getAdmins();
  const target = admins.find((a) => a.id === id);
  if (!target) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }
  await saveAdmins(admins.filter((a) => a.id !== id));
  await addAuditEntry({ actorEmail: admin.email, action: "deleteAdmin", target: target.email });
  return NextResponse.json({ ok: true });
}
