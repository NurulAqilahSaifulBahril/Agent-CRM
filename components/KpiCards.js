"use client";

import { useCrm } from "@/context/CrmContext";
import { bucketOf } from "@/lib/statusConfig";

export default function KpiCards() {
  const { leads } = useCrm();

  const counts = { all: leads.length, Active: 0, Won: 0, Lost: 0 };
  leads.forEach((l) => counts[bucketOf(l.status)]++);

  const cards = [
    { label: "Total", value: counts.all, className: "text-gray-900" },
    { label: "Active", value: counts.Active, className: "text-blue-600" },
    { label: "Confirmed", value: counts.Won, className: "text-green-600" },
    { label: "Lost", value: counts.Lost, className: "text-red-600" },
  ];

  return (
    <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg bg-gray-50 p-2.5">
          <p className="mb-1 text-xs text-gray-500">{c.label}</p>
          <p className={`text-xl font-medium ${c.className}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
