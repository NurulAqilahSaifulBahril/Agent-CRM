"use client";

import { createContext, useContext, useState } from "react";
import {
  initialLeads,
  initialUrgent,
  initialReminder,
  siteVisits,
} from "@/lib/mockData";

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const [leads, setLeads] = useState(initialLeads);
  const [urgent, setUrgent] = useState(initialUrgent);
  const [reminder, setReminder] = useState(initialReminder);

  function addLeadActivity(leadId, entry) {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, activity: [entry, ...(lead.activity || [])] }
          : lead
      )
    );
  }

  function updateLeadStatus(leadId, status) {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
    );
    addLeadActivity(leadId, {
      icon: "Flag",
      text: `Status changed to ${status}`,
      when: "just now",
    });
  }

  function markFollowedUp(leadId) {
    addLeadActivity(leadId, {
      icon: "MessageCircle",
      text: "Marked as followed up via WhatsApp",
      when: "just now",
    });
  }

  function updateLeadRemark(leadId, remark) {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, remark } : lead))
    );
  }

  function dismissNotification(type, id) {
    if (type === "urgent") {
      setUrgent((prev) => prev.filter((n) => n.id !== id));
    } else {
      setReminder((prev) => prev.filter((n) => n.id !== id));
    }
  }

  function clearAllNotifications() {
    setUrgent([]);
    setReminder([]);
  }

  function addLead(data) {
    const nextId = Math.max(0, ...leads.map((l) => l.id)) + 1;
    const newLead = {
      id: nextId,
      name: data.name,
      phone: data.phone,
      address: data.address,
      source: data.source,
      status: "New Lead",
      lastActivity: "just now",
      package: data.package,
      activity: [
        { icon: "UserPlus", text: `Lead created via ${data.source}`, when: "just now" },
      ],
    };
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  }

  const value = {
    leads,
    urgent,
    reminder,
    siteVisits,
    updateLeadStatus,
    markFollowedUp,
    updateLeadRemark,
    dismissNotification,
    clearAllNotifications,
    addLead,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used within a CrmProvider");
  return ctx;
}
