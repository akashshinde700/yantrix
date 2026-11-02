import { PageHeader } from "@/components/admin/page-header";
import { MediaLibrary } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";

export default function MediaAdminPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Media library"
        description="Every image uploaded from the admin panel. Copy a URL to reuse it in any field, or delete images you no longer need."
      />
      <MediaLibrary />
    </div>
  );
}
