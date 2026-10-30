"use client";

import { createContext, useContext, type ReactNode } from "react";
import { canWrite, isOwner } from "@/lib/admin/permissions";
import type { AdminRole } from "@/lib/content/types";

interface AdminRoleValue {
  role: AdminRole;
  /** May create / edit / delete content. */
  canWrite: boolean;
  /** May manage other admin accounts. */
  isOwner: boolean;
}

const AdminRoleContext = createContext<AdminRoleValue>({
  role: "viewer",
  canWrite: false,
  isOwner: false,
});

/**
 * Makes the signed-in admin's role available to the panel's editor widgets so a
 * read-only `viewer` does not get buttons whose only outcome is a 403. The API
 * remains the authority — this only hides what cannot succeed.
 */
export function AdminRoleProvider({ role, children }: { role: AdminRole; children: ReactNode }) {
  return (
    <AdminRoleContext.Provider value={{ role, canWrite: canWrite(role), isOwner: isOwner(role) }}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole(): AdminRoleValue {
  return useContext(AdminRoleContext);
}
