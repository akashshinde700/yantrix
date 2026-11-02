"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdminRole } from "@/components/admin/role-context";
import type { MediaEntry } from "@/lib/content/types";

/** Same browser-side downscale the image picker uses, so uploads stay small. */
const MAX_SIDE = 1600;

async function shrink(file: File): Promise<{ blob: Blob; name: string }> {
  const name = file.name.replace(/\.\w+$/, ".webp");
  if (file.type === "image/gif" || file.type === "image/svg+xml") return { blob: file, name: file.name };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86)
    );
    return blob ? { blob, name } : { blob: file, name: file.name };
  } catch {
    return { blob: file, name: file.name };
  }
}

function readable(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Media library: every image uploaded from any admin form, with copy-URL and
 * delete. Images live in the content store (MySQL `media` table, or
 * `data/media` in JSON mode) and are served from `/media/<id>`, so a copied URL
 * keeps working after a redeploy.
 */
export function MediaLibrary() {
  const [items, setItems] = useState<MediaEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { canWrite } = useAdminRole();
  const { toast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/media", { credentials: "same-origin" });
    const json = (await res.json().catch(() => ({}))) as { items?: MediaEntry[] };
    setItems(json.items ?? []);
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const res = await fetch("/api/admin/media", { credentials: "same-origin" });
      const json = (await res.json().catch(() => ({}))) as { items?: MediaEntry[] };
      if (alive) setItems(json.items ?? []);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    let uploaded = 0;
    for (const file of list) {
      const { blob, name } = await shrink(file);
      const body = new FormData();
      body.append("file", blob, name);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body,
        credentials: "same-origin",
      });
      if (res.ok) uploaded += 1;
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    await load();
    toast({
      title: uploaded ? `${uploaded} image${uploaded > 1 ? "s" : ""} uploaded` : "Upload failed",
      description: uploaded
        ? "Click Copy URL on any image to paste it into a field."
        : "Try a smaller file, or a JPG, PNG or WebP image.",
      variant: uploaded ? undefined : "destructive",
    });
  };

  const remove = async (item: MediaEntry) => {
    if (!window.confirm("Delete this image? Anything still using it will show no picture.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/media?id=${encodeURIComponent(item.id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const json = (await res.json().catch(() => ({}))) as { items?: MediaEntry[] };
    setItems(json.items ?? items);
    setBusy(false);
    toast({ title: res.ok ? "Image deleted" : "Could not delete the image" });
  };

  const copy = async (item: MediaEntry) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      toast({ title: "Copy this URL", description: item.url });
    }
  };

  return (
    <section className="space-y-5">
      <div
        onDragOver={(event) => {
          if (!canWrite) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (canWrite) void upload(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <UploadCloud className="h-6 w-6 text-slate-500" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink">Drop images here, or choose files</p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, WebP or GIF up to 4 MB each. Large photos are resized in your browser
            before upload.
          </p>
        </div>
        {canWrite ? (
          <div className="flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-1.5 h-4 w-4" />
              )}
              Choose images
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void load()}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Refresh
            </Button>
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => event.target.files && void upload(event.target.files)}
        />
      </div>

      {items === null ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading images…
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-muted-foreground">
          No images yet. Uploads from any field (course cover, trainer photo, gallery…) also appear
          here.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate font-mono text-[10px] text-slate-500">{item.url}</p>
                <p className="text-[10px] text-slate-400">
                  {readable(item.bytes)} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 px-2 text-xs"
                    onClick={() => void copy(item)}
                  >
                    {copied === item.id ? (
                      <Check className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <Copy className="mr-1 h-3.5 w-3.5" />
                    )}
                    {copied === item.id ? "Copied" : "Copy URL"}
                  </Button>
                  {canWrite ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete image"
                      disabled={busy}
                      onClick={() => void remove(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
