import { NextResponse } from "next/server";
import { canWrite, getSessionAdmin } from "@/lib/admin/auth";
import { getEnquiries } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  }
  if (!canWrite(admin.role) && admin.role !== "viewer") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const enquiries = await getEnquiries();
  return NextResponse.json({ ok: true, enquiries });
}
