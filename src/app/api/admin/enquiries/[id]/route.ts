import { NextRequest, NextResponse } from "next/server";
import { canWrite, getSessionAdmin } from "@/lib/admin/auth";
import { addAuditEntry, deleteEnquiry, updateEnquiry } from "@/lib/content/store";
import type { EnquiryStatus } from "@/lib/content/types";

const STATUSES: EnquiryStatus[] = ["new", "contacted", "enrolled", "closed", "spam"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  if (!canWrite(admin.role)) {
    return NextResponse.json({ ok: false, error: "Read-only access." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    notes?: string;
  };

  const patch: { status?: EnquiryStatus; notes?: string } = {};
  if (body.status && STATUSES.includes(body.status as EnquiryStatus)) {
    patch.status = body.status as EnquiryStatus;
  }
  if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 2000);

  const enquiry = await updateEnquiry(id, patch);
  if (!enquiry) {
    return NextResponse.json({ ok: false, error: "Enquiry not found." }, { status: 404 });
  }
  await addAuditEntry({ actorEmail: admin.email, action: "updateEnquiry", target: id });
  return NextResponse.json({ ok: true, enquiry });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  if (!canWrite(admin.role)) {
    return NextResponse.json({ ok: false, error: "Read-only access." }, { status: 403 });
  }
  const { id } = await params;
  const removed = await deleteEnquiry(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: "Enquiry not found." }, { status: 404 });
  }
  await addAuditEntry({ actorEmail: admin.email, action: "deleteEnquiry", target: id });
  return NextResponse.json({ ok: true });
}
