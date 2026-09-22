"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Check } from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { stageOf, bucketOf, STAGE_STYLES, BUCKET_LABELS } from "@/lib/statusConfig";
import { toWhatsAppLink } from "@/lib/whatsapp";

function WhatsAppButton({ name, phone }) {
  const [sent, setSent] = useState(false);

  return (
    <button
      aria-label={`Open WhatsApp chat with ${name}`}
      onClick={(e) => {
        e.stopPropagation();
        window.open(toWhatsAppLink(phone), "_blank", "noopener,noreferrer");
        setSent(true);
        setTimeout(() => setSent(false), 1200);
      }}
      className="rounded p-1 text-gray-500 hover:bg-gray-100"
    >
      {sent ? <Check size={14} className="text-green-600" /> : <MessageCircle size={14} />}
    </button>
  );
}

export default function LeadTable() {
  const { leads } = useCrm();
  const router = useRouter();
  const [activeBucket, setActiveBucket] = useState("all");
  const [search, setSearch] = useState("");

  const counts = { all: leads.length, Active: 0, Won: 0, Lost: 0 };
  leads.forEach((l) => counts[bucketOf(l.status)]++);

  const filtered = leads.filter((l) => {
    const matchesBucket = activeBucket === "all" || bucketOf(l.status) === activeBucket;
    const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase());
    return matchesBucket && matchesSearch;
  });

  return (
    <div>
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {["all", "Active", "Won", "Lost"].map((key) => (
            <button
              key={key}
              onClick={() => setActiveBucket(key)}
              className={`rounded-md border px-2 py-1 text-xs ${
                activeBucket === key
                  ? "border-gray-400 bg-gray-100"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {BUCKET_LABELS[key]} ({counts[key]})
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="min-w-[140px] flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[36%]" />
            <col className="w-[26%]" />
            <col className="w-[24%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="px-1 py-1.5 text-left font-medium">Lead</th>
              <th className="px-1 py-1.5 text-left font-medium">Source</th>
              <th className="px-1 py-1.5 text-left font-medium">Status</th>
              <th className="px-1 py-1.5 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-1 py-1.5">
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-[11px] text-gray-400">{lead.lastActivity}</p>
                </td>
                <td className="px-1 py-1.5 text-gray-600">{lead.source}</td>
                <td className="px-1 py-1.5">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] ${
                      STAGE_STYLES[stageOf(lead.status)]
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-1 py-1.5">
                  <WhatsAppButton name={lead.name} phone={lead.phone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
