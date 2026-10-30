import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/admin/auth";
import { getEnquiries } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  }
  // Every signed-in role (owner, editor, viewer) may read enquiries;
  // only owner/editor may change them — see enquiries/[id]/route.ts.
  const enquiries = await getEnquiries();
  return NextResponse.json({ ok: true, enquiries });
}
