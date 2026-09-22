import LeadDetail from "@/components/LeadDetail";
import { initialLeads } from "@/lib/mockData";

export function generateStaticParams() {
  return initialLeads.map((lead) => ({ id: String(lead.id) }));
}

export default async function LeadDetailPage({ params }) {
  const { id } = await params;
  return <LeadDetail leadId={Number(id)} />;
}
