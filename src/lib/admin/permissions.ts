/**
 * Role rules for the admin panel — pure functions with no server imports so
 * that both the API routes (the authority) and the panel UI (which hides
 * controls it knows will be rejected) can use the same definitions.
 */

import type { AdminRole } from "@/lib/content/types";

/** Roles allowed to make changes. `viewer` is read-only. */
export function canWrite(role: AdminRole | undefined): boolean {
  return role === "owner" || role === "editor";
}

/** Roles allowed to manage other admin accounts. */
export function isOwner(role: AdminRole | undefined): boolean {
  return role === "owner";
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Viewer (read-only)",
};
