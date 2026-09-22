import Link from "next/link";
import { Plus } from "lucide-react";
import KpiCards from "@/components/KpiCards";
import LeadTable from "@/components/LeadTable";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-base font-medium">Leads</span>
        <Link
          href="/dashboard/leads/new"
          className="flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs hover:bg-gray-50"
        >
          <Plus size={14} />
          New lead
        </Link>
      </div>
      <KpiCards />
      <LeadTable />
    </div>
  );
}
