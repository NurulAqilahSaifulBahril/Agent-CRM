"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useCrm } from "@/context/CrmContext";

function NotificationGroup({ label, labelClass, items, onDismiss, onOpen }) {
  return (
    <div className="mb-3.5">
      <p className={`mb-1.5 text-[11px] font-medium ${labelClass}`}>{label}</p>
      {items.length === 0 ? (
        <p className="text-[11px] text-gray-400">All caught up</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpen(item.leadId)}
              className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-5 transition-colors hover:bg-gray-50"
            >
              <p className="truncate text-xs font-medium text-gray-900">{item.name}</p>
              <p className="truncate text-[11px] text-gray-500">
                {item.status} &middot; {item.wait}
              </p>
              <button
                aria-label={`Dismiss notification for ${item.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(item.id);
                }}
                className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationPanel() {
  const { urgent, reminder, siteVisits, dismissNotification, clearAllNotifications } =
    useCrm();
  const router = useRouter();

  function openLead(leadId) {
    router.push(`/dashboard/leads/${leadId}`);
  }

  return (
    <div className="w-[190px] shrink-0 border-r border-gray-200 p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium">Notifications</span>
        <button
          onClick={clearAllNotifications}
          className="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-600 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>

      <NotificationGroup
        label="Waiting on you"
        labelClass="text-red-600"
        items={urgent}
        onOpen={openLead}
        onDismiss={(id) => dismissNotification("urgent", id)}
      />
      <NotificationGroup
        label="Waiting on customer"
        labelClass="text-amber-600"
        items={reminder}
        onOpen={openLead}
        onDismiss={(id) => dismissNotification("reminder", id)}
      />

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-blue-600">Site visits</p>
        <div className="flex flex-col gap-1.5">
          {siteVisits.map((v) => (
            <div
              key={v.id}
              role="button"
              tabIndex={0}
              onClick={() => openLead(v.leadId)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-1.5 hover:bg-gray-50"
            >
              <p className="truncate text-xs font-medium text-gray-900">{v.name}</p>
              <p className="text-[11px] text-gray-500">{v.when}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
