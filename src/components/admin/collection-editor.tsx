"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminPost } from "@/components/admin/api";
import { useAdminRole } from "@/components/admin/role-context";
import { SchemaForm, type AdminField } from "@/components/admin/schema-form";
import type { BaseItem, CollectionKey } from "@/lib/content/types";

export interface CollectionEditorProps {
  collection: CollectionKey;
  title: string;
  description?: string;
  addLabel?: string;
  fields: AdminField[];
  items: BaseItem[];
  defaults: Record<string, unknown>;
  /** Field used as the list title */
  titleField: string;
  /** Optional secondary line in the list */
  subtitleField?: string;
  emptyHint?: string;
}

export function CollectionEditor({
  collection,
  title,
  description,
  addLabel = "Add new",
  fields,
  items,
  defaults,
  titleField,
  subtitleField,
  emptyHint,
}: CollectionEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  // Read-only accounts see the list but none of the controls that would 403.
  const { canWrite } = useAdminRole();
  const [editing, setEditing] = useState<BaseItem | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  const run = async (body: Record<string, unknown>, successMessage: string) => {
    const result = await adminPost(body);
    if (!result.ok) {
      toast({ variant: "destructive", title: "Not saved", description: result.error });
      return false;
    }
    toast({ title: successMessage });
    router.refresh();
    return true;
  };

  const saveItem = async (values: Record<string, unknown>) => {
    const target = editing;
    if (!target) return { ok: false, error: "Nothing to save." };

    if (target === "new") {
      const result = await adminPost({ op: "createItem", collection, item: values });
      if (!result.ok) return result;
      setEditing(null);
      toast({ title: "Item added" });
      router.refresh();
      return result;
    }

    const result = await adminPost({
      op: "updateItem",
      collection,
      id: target.id,
      item: values,
    });
    if (!result.ok) return result;
    setEditing(null);
    toast({ title: "Item updated" });
    router.refresh();
    return result;
  };

  const initialValues =
    editing === "new"
      ? { ...defaults, active: true }
      : editing
        ? ({ ...editing } as unknown as Record<string, unknown>)
        : {};

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {canWrite ? (
          <Button
            onClick={() => setEditing("new")}
            className="btn-futur h-9 rounded-lg px-4 text-sm font-bold text-white"
          >
            <Plus className="mr-1.5 h-4 w-4" /> {addLabel}
          </Button>
        ) : null}
      </header>

      {sorted.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">
          {emptyHint ?? "No items yet. Use the button above to add one."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sorted.map((item, index) => {
            const record = item as unknown as Record<string, unknown>;
            const primary = String(record[titleField] ?? "(untitled)");
            const secondary = subtitleField ? String(record[subtitleField] ?? "") : "";
            const inactive = item.active === false;
            return (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {primary || "(untitled)"}
                      {inactive ? (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          Hidden
                        </Badge>
                      ) : null}
                    </p>
                    {secondary ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{secondary}</p>
                    ) : null}
                  </div>
                </div>

                {canWrite ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === 0 || busyId !== null}
                      title="Move up"
                      onClick={async () => {
                        setBusyId(item.id);
                        await run(
                          { op: "moveItem", collection, id: item.id, direction: "up" },
                          "Order updated"
                        );
                        setBusyId(null);
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === sorted.length - 1 || busyId !== null}
                      title="Move down"
                      onClick={async () => {
                        setBusyId(item.id);
                        await run(
                          { op: "moveItem", collection, id: item.id, direction: "down" },
                          "Order updated"
                        );
                        setBusyId(null);
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={inactive ? "Show on website" : "Hide from website"}
                      onClick={() =>
                        run(
                          {
                            op: "updateItem",
                            collection,
                            id: item.id,
                            item: { ...record, active: inactive },
                          },
                          inactive ? "Item published" : "Item hidden"
                        )
                      }
                    >
                      {inactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Edit"
                      onClick={() => setEditing(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            `Delete "${primary || "this item"}"? This cannot be undone.`
                          )
                        ) {
                          return;
                        }
                        setBusyId(item.id);
                        await run(
                          { op: "deleteItem", collection, id: item.id },
                          "Item deleted"
                        );
                        setBusyId(null);
                      }}
                    >
                      {busyId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? addLabel : `Edit ${title.toLowerCase()}`}</DialogTitle>
            <DialogDescription>
              Changes are saved to the website immediately after you save.
            </DialogDescription>
          </DialogHeader>
          <SchemaForm
            layout="dialog"
            groups={[{ title, fields }]}
            initial={initialValues}
            onSubmit={saveItem}
            submitLabel={editing === "new" ? "Add item" : "Save changes"}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
