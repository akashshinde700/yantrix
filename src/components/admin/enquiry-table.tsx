"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Enquiry, EnquiryStatus } from "@/lib/content/types";

const STATUSES: EnquiryStatus[] = [
  "new",
  "contacted",
  "enrolled",
  "closed",
  "spam",
];

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "bg-brand-50 text-brand-700 ring-brand-100",
  contacted: "bg-amber-50 text-amber-700 ring-amber-200",
  enrolled: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  spam: "bg-destructive/10 text-destructive ring-destructive/20",
};

/**
 * One CSV cell, quoted for a spreadsheet.
 *
 * Quoting alone does not stop formula injection: Excel and Sheets strip the
 * quotes and evaluate anything starting with `=`, `+`, `-`, `@`, a tab or a CR.
 * Enquiry names and messages come straight from the public contact form, so a
 * submission like `=HYPERLINK("http://evil","click")` would become a live
 * formula in the owner's spreadsheet. Prefixing a single quote forces the cell
 * to be treated as text.
 */
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  const guarded = FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export function EnquiryTable({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries.filter((enquiry) => {
      const matchesStatus =
        statusFilter === "all" || enquiry.status === statusFilter;
      const matchesQuery =
        !q ||
        [
          enquiry.name,
          enquiry.email,
          enquiry.mobile,
          enquiry.course,
          enquiry.message ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [enquiries, query, statusFilter]);

  const patch = async (
    id: string,
    body: Record<string, unknown>,
    message: string,
  ) => {
    setBusyId(id);
    const response = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    setBusyId(null);
    if (!response.ok || !data.ok) {
      toast({
        variant: "destructive",
        title: "Not saved",
        description: data.error,
      });
      return false;
    }
    toast({ title: message });
    router.refresh();
    return true;
  };

  const remove = async (enquiry: Enquiry) => {
    if (!window.confirm(`Delete the enquiry from ${enquiry.name}?`)) return;
    setBusyId(enquiry.id);
    const response = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
      method: "DELETE",
    });
    setBusyId(null);
    if (!response.ok) {
      toast({ variant: "destructive", title: "Could not delete" });
      return;
    }
    toast({ title: "Enquiry deleted" });
    setSelected(null);
    router.refresh();
  };

  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Mobile", "Course", "Status", "Message", "Created"],
      ...filtered.map((enquiry) => [
        enquiry.name,
        enquiry.email,
        enquiry.mobile,
        enquiry.course,
        enquiry.status,
        (enquiry.message ?? "").replace(/\n/g, " "),
        new Date(enquiry.createdAt).toLocaleString(),
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `yantrix-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    // The anchor must be in the document for Safari, and the object URL has to
    // outlive the click or Firefox cancels the download.
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, mobile or course…"
            className="h-10 pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            aria-label="Filter by status"
            className="h-10 w-full sm:w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={exportCsv}
          className="h-10 rounded-lg font-semibold"
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-muted-foreground">
          No enquiries match your filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Course
                </th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Received
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((enquiry) => (
                <tr key={enquiry.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <button
                      className="text-left font-semibold text-ink hover:text-brand-700"
                      onClick={() => {
                        setSelected(enquiry);
                        setNotes(enquiry.notes);
                      }}
                    >
                      {enquiry.name}
                    </button>
                    <p className="text-xs text-slate-500">{enquiry.mobile}</p>
                    <p className="text-xs text-slate-500">{enquiry.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                    {enquiry.course}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={enquiry.status}
                      onValueChange={(value) =>
                        patch(enquiry.id, { status: value }, "Status updated")
                      }
                    >
                      <SelectTrigger
                        aria-label={`Status for ${enquiry.name}`}
                        className={`h-8 w-32 rounded-full text-xs font-bold capitalize ring-1 ${STATUS_STYLES[enquiry.status]}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="capitalize"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(enquiry)}
                      disabled={busyId === enquiry.id}
                      aria-label="Delete enquiry"
                    >
                      {busyId === enquiry.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-xl">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.course} ·{" "}
                  {new Date(selected.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-400">
                    Mobile
                  </dt>
                  <dd>
                    <a
                      href={`tel:${selected.mobile}`}
                      className="font-semibold text-brand-700"
                    >
                      {selected.mobile}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-400">
                    Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${selected.email}`}
                      className="break-all font-semibold text-brand-700"
                    >
                      {selected.email}
                    </a>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase text-slate-400">
                    Message
                  </dt>
                  <dd className="whitespace-pre-line text-slate-700">
                    {selected.message || "—"}
                  </dd>
                </div>
              </dl>
              <div className="space-y-2">
                <label
                  htmlFor="notes"
                  className="text-xs font-semibold uppercase text-slate-400"
                >
                  Internal notes
                </label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Called on Monday, interested in the next batch…"
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => remove(selected)}>
                  Delete
                </Button>
                <Button
                  onClick={async () => {
                    const done = await patch(
                      selected.id,
                      { notes },
                      "Notes saved",
                    );
                    if (done) setSelected(null);
                  }}
                  className="font-bold"
                >
                  Save notes
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
