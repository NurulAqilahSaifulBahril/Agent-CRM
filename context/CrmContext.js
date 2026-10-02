"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addLeadAction,
  deleteLeadAction,
  logFollowUpAction,
  updateLeadAction,
} from "@/app/actions";
import { buildNotifications } from "@/lib/followUps";

const CrmContext = createContext(null);

// Leads and notifications arrive from the server. Edits show straight away and
// are saved to the server; its saved copy of the lead replaces the local one.
export function CrmProvider({ user, initialLeads, initialNow, children }) {
  const [leads, setLeads] = useState(initialLeads);
  // Starts at the server's time so the first render matches, then ticks each minute.
  const [now, setNow] = useState(initialNow);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Alerts follow each lead's status, so changing a status changes its alert.
  const notifications = useMemo(() => buildNotifications(leads, now), [leads, now]);
  const visible = (items) => items.filter((n) => !dismissed.includes(n.id));
  const urgent = visible(notifications.urgent);
  const reminder = visible(notifications.reminder);
  const siteVisits = visible(notifications.siteVisits);

  function replaceLead(saved) {
    if (saved) setLeads((prev) => prev.map((lead) => (lead.id === saved.id ? saved : lead)));
  }

  // Apply a change locally, then save it; put the old list back if saving fails.
  async function saveLead(leadId, localChange, save) {
    const before = leads;
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? localChange(lead) : lead)));
    try {
      replaceLead(await save());
    } catch (err) {
      console.error(err);
      setLeads(before);
    }
  }

  function updateLeadStatus(leadId, status) {
    return saveLead(
      leadId,
      (lead) => ({ ...lead, status, statusChangedAt: new Date().toISOString() }),
      () => updateLeadAction(leadId, { status })
    );
  }

  function markFollowedUp(leadId) {
    return saveLead(
      leadId,
      (lead) => ({
        ...lead,
        activity: [
          { icon: "MessageCircle", text: "Marked as followed up via WhatsApp", when: "just now" },
          ...(lead.activity || []),
        ],
      }),
      () => logFollowUpAction(leadId)
    );
  }

  // Picking "Appointment Scheduled" saves the status and the visit time together.
  function scheduleAppointment(leadId, appointmentAt) {
    return saveLead(
      leadId,
      (lead) => ({
        ...lead,
        status: "Appointment Scheduled",
        appointmentAt,
        statusChangedAt: new Date().toISOString(),
      }),
      () => updateLeadAction(leadId, { status: "Appointment Scheduled", appointmentAt })
    );
  }

  function updateLeadRemark(leadId, remark) {
    return saveLead(
      leadId,
      (lead) => ({ ...lead, remark }),
      () => updateLeadAction(leadId, { remark })
    );
  }

  function updateLeadTotalPrice(leadId, totalPrice) {
    return saveLead(
      leadId,
      (lead) => ({ ...lead, totalPrice }),
      () => updateLeadAction(leadId, { totalPrice })
    );
  }

  function updateLeadPaymentReceived(leadId, paymentReceived) {
    return saveLead(
      leadId,
      (lead) => ({ ...lead, paymentReceived }),
      () => updateLeadAction(leadId, { paymentReceived })
    );
  }

  function dismissNotification(type, id) {
    setDismissed((prev) => [...prev, id]);
  }

  function clearAllNotifications() {
    setDismissed((prev) => [
      ...prev,
      ...[...urgent, ...reminder, ...siteVisits].map((n) => n.id),
    ]);
  }

  async function addLead(data) {
    const newLead = await addLeadAction(data);
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  }

  async function deleteLead(leadId) {
    const deleted = await deleteLeadAction(leadId);
    if (!deleted) return false;
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    return true;
  }

  const value = {
    user,
    leads,
    urgent,
    reminder,
    siteVisits,
    updateLeadStatus,
    markFollowedUp,
    scheduleAppointment,
    updateLeadRemark,
    updateLeadTotalPrice,
    updateLeadPaymentReceived,
    dismissNotification,
    clearAllNotifications,
    addLead,
    deleteLead,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used within a CrmProvider");
  return ctx;
}
