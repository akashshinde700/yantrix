"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminPost } from "@/components/admin/api";
import { cn } from "@/lib/utils";

export type AdminFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "stringList"
  | "pairs";

export interface AdminField {
  name: string;
  label: string;
  type?: AdminFieldType;
  placeholder?: string;
  help?: string;
  options?: { label: string; value: string }[];
  /** grid span on large screens */
  span?: 1 | 2;
}

export interface AdminGroup {
  title: string;
  description?: string;
  fields: AdminField[];
}

type Values = Record<string, unknown>;

function getPath(values: Values, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Values)[key];
    return undefined;
  }, values);
}

function setPath(values: Values, path: string, value: unknown): Values {
  const keys = path.split(".");
  const clone: Values = { ...values };
  let cursor: Values = clone;
  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1;
    const current = cursor[key];
    if (isLast) {
      cursor[key] = value;
      return;
    }
    const next = current && typeof current === "object" ? { ...(current as Values) } : {};
    cursor[key] = next;
    cursor = next;
  });
  return clone;
}

export function SchemaForm({
  groups,
  initial,
  op,
  submitLabel = "Save changes",
  intro,
  onSubmit,
  layout = "page",
}: {
  groups: AdminGroup[];
  initial: Values;
  op?: "updateSettings" | "updateSeo" | "updateSections" | "updatePages";
  submitLabel?: string;
  intro?: string;
  /** Custom save handler (used by the collection editor dialogs). */
  onSubmit?: (values: Values) => Promise<{ ok: boolean; error?: string }>;
  layout?: "page" | "dialog";
}) {
  const [values, setValues] = useState<Values>(initial);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const update = (name: string, value: unknown) => {
    setValues((current) => setPath(current, name, value));
    setDirty(true);
  };

  const save = async () => {
    if (!onSubmit && !op) return;
    setSaving(true);
    const result = onSubmit
      ? await onSubmit(values)
      : await adminPost({ op, value: values });
    setSaving(false);
    if (!result.ok) {
      toast({ variant: "destructive", title: "Not saved", description: result.error });
      return;
    }
    setDirty(false);
    toast({ title: "Saved", description: "Your changes are live on the website." });
    router.refresh();
  };

  const rendered = useMemo(
    () =>
      groups.map((group) => (
        <section
          key={group.title}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <header className="mb-5">
            <h2 className="text-base font-bold text-ink">{group.title}</h2>
            {group.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
            ) : null}
          </header>
          <div className="grid gap-5 sm:grid-cols-2">
            {group.fields.map((field) => {
              const value = getPath(values, field.name);
              return (
                <div
                  key={field.name}
                  className={cn("space-y-2", field.span === 2 || field.type === "textarea" || field.type === "stringList" || field.type === "pairs" ? "sm:col-span-2" : "")}
                >
                  <Label htmlFor={field.name} className="text-sm font-semibold">
                    {field.label}
                  </Label>

                  {field.type === "boolean" ? (
                    <div className="flex h-10 items-center gap-3 rounded-lg border border-slate-200 px-3">
                      <Switch
                        id={field.name}
                        checked={Boolean(value)}
                        onCheckedChange={(checked) => update(field.name, checked)}
                      />
                      <span className="text-sm text-slate-600">{value ? "On" : "Off"}</span>
                    </div>
                  ) : field.type === "select" ? (
                    <Select
                      value={String(value ?? "")}
                      onValueChange={(next) => update(field.name, next)}
                    >
                      <SelectTrigger id={field.name} className="h-10">
                        <SelectValue placeholder={field.placeholder ?? "Select…"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      rows={4}
                      placeholder={field.placeholder}
                      value={String(value ?? "")}
                      onChange={(event) => update(field.name, event.target.value)}
                    />
                  ) : field.type === "stringList" ? (
                    <Textarea
                      id={field.name}
                      rows={5}
                      placeholder={field.placeholder ?? "One item per line"}
                      value={Array.isArray(value) ? (value as string[]).join("\n") : String(value ?? "")}
                      onChange={(event) =>
                        update(
                          field.name,
                          event.target.value
                            .split("\n")
                            .map((line) => line.trimEnd())
                            .filter((line, index, all) => line.length > 0 || index < all.length - 1)
                        )
                      }
                    />
                  ) : field.type === "pairs" ? (
                    <Textarea
                      id={field.name}
                      rows={6}
                      placeholder={field.placeholder ?? "Label | Value (one per line)"}
                      value={
                        Array.isArray(value)
                          ? (value as { label: string; value: string }[])
                              .map((pair) => `${pair.label} | ${pair.value}`)
                              .join("\n")
                          : ""
                      }
                      onChange={(event) =>
                        update(
                          field.name,
                          event.target.value
                            .split("\n")
                            .map((line) => {
                              const [label, ...rest] = line.split("|");
                              return { label: (label ?? "").trim(), value: rest.join("|").trim() };
                            })
                            .filter((pair) => pair.label || pair.value)
                        )
                      }
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={field.placeholder}
                      value={value === undefined || value === null ? "" : String(value)}
                      onChange={(event) =>
                        update(
                          field.name,
                          field.type === "number" ? Number(event.target.value) : event.target.value
                        )
                      }
                    />
                  )}

                  {field.help ? (
                    <p className="text-xs text-muted-foreground">{field.help}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      )),
    [groups, values]
  );

  return (
    <div className={layout === "page" ? "space-y-5 pb-24" : "space-y-5"}>
      {intro ? (
        <p className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
          {intro}
        </p>
      ) : null}
      {rendered}

      <div
        className={
          layout === "page"
            ? "sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur"
            : "flex items-center justify-end gap-4 border-t border-slate-100 pt-4"
        }
      >
        {layout === "page" ? (
          <p className="text-sm text-slate-500">
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
        ) : null}
        <Button
          onClick={save}
          disabled={saving}
          className="btn-futur h-10 rounded-xl font-bold text-white"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
