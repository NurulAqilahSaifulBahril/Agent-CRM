import LeadDetail from "@/components/LeadDetail";

export default async function LeadDetailPage({ params }) {
  const { id } = await params;
  return <LeadDetail leadId={decodeURIComponent(id)} />;
}
