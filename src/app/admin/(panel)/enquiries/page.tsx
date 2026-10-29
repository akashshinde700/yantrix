import { PageHeader } from "@/components/admin/page-header";
import { EnquiryTable } from "@/components/admin/enquiry-table";
import { getEnquiries } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function EnquiriesAdminPage() {
  const enquiries = await getEnquiries();
  const counts = enquiries.reduce<Record<string, number>>((acc, enquiry) => {
    acc[enquiry.status] = (acc[enquiry.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Enquiries"
        description="Every course enquiry submitted through the website. Update the status, add internal notes, or export everything to CSV."
      >
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {Object.entries(counts).map(([status, count]) => (
            <span key={status} className="rounded-full bg-white px-3 py-1.5 capitalize text-slate-600 ring-1 ring-slate-200">
              {status}: {count}
            </span>
          ))}
        </div>
      </PageHeader>
      <EnquiryTable enquiries={enquiries} />
    </div>
  );
}
