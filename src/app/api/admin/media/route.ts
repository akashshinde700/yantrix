import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { canWrite, getSessionAdmin } from "@/lib/admin/auth";
import { addAuditEntry, saveMedia } from "@/lib/content/store";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024;

/** Identify the image type from its first bytes — never trust the browser-sent type. */
function sniff(bytes: Buffer): string | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.length > 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (bytes.length > 6 && bytes.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  return null;
}

/**
 * Upload an image (trainer photos, placed-student photos…). Images are stored
 * in the database (MySQL `media` table, or data/media in JSON mode) and served
 * from /media/<id>, so they survive redeploys and work on read-only hosts.
 * The admin form resizes photos in the browser before uploading.
 */
export async function POST(request: NextRequest) {
  const admin = await getSessionAdmin();
  if (!admin || !canWrite(admin.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    file = value instanceof File ? value : null;
  } catch {
    /* handled below */
  }
  if (!file) return NextResponse.json({ ok: false, error: "No file received." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Image is larger than 4 MB." }, { status: 413 });

  const data = Buffer.from(await file.arrayBuffer());
  const mime = sniff(data);
  if (!mime) {
    return NextResponse.json({ ok: false, error: "Only JPG, PNG, WebP or GIF images are allowed." }, { status: 415 });
  }

  const id = randomUUID();
  await saveMedia(id, mime, data);
  await addAuditEntry({ actorEmail: admin.email, action: "media.upload", target: id });
  return NextResponse.json({ ok: true, url: `/media/${id}` });
}
