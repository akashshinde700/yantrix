"use client";

export interface AdminApiResponse {
  ok: boolean;
  error?: string;
  content?: unknown;
}

/** POST a change to the content API. */
export async function adminPost(body: Record<string, unknown>): Promise<AdminApiResponse> {
  const response = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as AdminApiResponse;
  if (!response.ok || !data.ok) {
    return { ok: false, error: data.error || "Could not save your changes." };
  }
  return data;
}

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  return (await response.json()) as T;
}
