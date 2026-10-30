import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  ensureDefaultAdmin,
  getSessionAdmin,
  hashPassword,
  isOwner,
  publicAdmin,
} from "@/lib/admin/auth";
import { addAuditEntry, createAdmin, getAdmins } from "@/lib/content/store";
import type { AdminAccount } from "@/lib/content/types";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["owner", "editor", "viewer"]).default("editor"),
});

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  await ensureDefaultAdmin();
  const admins = await getAdmins();
  return NextResponse.json({ ok: true, admins: admins.map(publicAdmin) });
}

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  if (!isOwner(admin.role)) {
    return NextResponse.json(
      { ok: false, error: "Only the owner can manage admin accounts." },
      { status: 403 }
    );
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 422 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const account: AdminAccount = {
    id: randomBytes(8).toString("hex"),
    name: parsed.data.name,
    email,
    passwordHash: hashPassword(parsed.data.password),
    role: parsed.data.role,
    active: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    sessionVersion: 0,
  };

  // A single INSERT: concurrent creates cannot clobber each other, and the
  // UNIQUE(email) constraint decides the winner instead of a stale list read.
  const created = await createAdmin(account);
  if (!created) {
    return NextResponse.json({ ok: false, error: "That email is already in use." }, { status: 409 });
  }

  await addAuditEntry({ actorEmail: admin.email, action: "createAdmin", target: email });
  return NextResponse.json({ ok: true, admin: publicAdmin(account) }, { status: 201 });
}
