import { PageHeader } from "@/components/admin/page-header";
import { AdminsManager } from "@/components/admin/admins-manager";
import {
  ensureDefaultAdmin,
  getSessionAdmin,
  isOwner,
  publicAdmin,
} from "@/lib/admin/auth";
import { getAdmins } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function AdminsAdminPage() {
  await ensureDefaultAdmin();
  const [admins, current] = await Promise.all([getAdmins(), getSessionAdmin()]);

  return (
    <div>
      <PageHeader
        title="Admin users"
        description="Control who can edit the website. Owners manage accounts; editors can update content; viewers have read-only access."
      />
      <AdminsManager
        admins={admins.map(publicAdmin)}
        currentAdminId={current?.id ?? ""}
        isOwner={isOwner(current?.role)}
      />
    </div>
  );
}
