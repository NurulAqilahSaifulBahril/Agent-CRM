import { formatWait } from "./formatDate";

const DAY_MS = 24 * 60 * 60 * 1000;
const UPCOMING_DAYS = 7;
// A lead waiting on the customer comes back to the agent after this long.
const ESCALATE_AFTER_MS = 3 * DAY_MS;

// What each status asks of the agent. Moving a lead to the next status changes
// the alert, so the list works as a prompt for the next step.
const AGENT_TURN = {
  "New Lead": "contact now",
  Contacted: "did they reply?",
  "Follow-Up Required": "follow up",
  Interested: "send proposal",
  Negotiation: "continue negotiation",
  Confirmed: "arrange installation",
};

// The ball is with the customer. These flip to the agent after ESCALATE_AFTER_MS.
const CUSTOMER_TURN = {
  "Awaiting Response": "awaiting reply",
  "Pending Confirmation": "awaiting confirmation",
  "Proposal/Quotation Sent": "awaiting answer",
};

// Parked leads come back for a check-in after a while.
const RESURFACE_AFTER_MS = 21 * DAY_MS;
const PARKED = { "On Hold": "on hold", "No Response": "no response" };

// Finished for good: not even a leftover follow-up date raises an alert.
const CLOSED = new Set(["Completed", "Cancelled", "Not Interested"]);

export function formatAppointment(value) {
  return new Date(value).toLocaleString("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Turns each lead's status (and dates) into at most one notification:
// urgent = waiting on the agent, reminder = waiting on the customer,
// siteVisits = appointments still to come.
export function buildNotifications(leads, now = Date.now()) {
  const urgent = [];
  const reminder = [];
  const siteVisits = [];

  for (const lead of leads) {
    const { status } = lead;
    const appointment = lead.appointmentAt ? new Date(lead.appointmentAt).getTime() : null;
    const item = {
      id: `${lead.id}:${status}:${lead.appointmentAt || ""}`,
      leadId: lead.id,
      name: lead.name,
      status,
    };

    const since = new Date(lead.statusChangedAt || lead.updatedAt || lead.createdAt).getTime();

    if (AGENT_TURN[status]) {
      urgent.push({ ...item, due: since, wait: AGENT_TURN[status] });
    } else if (CUSTOMER_TURN[status]) {
      const waited = now - since;
      if (waited >= ESCALATE_AFTER_MS) {
        urgent.push({ ...item, due: since, wait: `no reply ${formatWait(waited)} · follow up` });
      } else {
        reminder.push({ ...item, due: since, wait: `${CUSTOMER_TURN[status]} ${formatWait(waited)}` });
      }
    } else if (PARKED[status]) {
      const parked = now - since;
      if (parked >= RESURFACE_AFTER_MS) {
        urgent.push({ ...item, due: since, wait: `${PARKED[status]} ${formatWait(parked)} · check in` });
      }
    } else if (status === "Appointment Scheduled") {
      if (appointment === null) {
        urgent.push({ ...item, due: 0, wait: "set visit date" });
      } else if (appointment <= now) {
        urgent.push({ ...item, due: appointment, wait: "visit done? update status" });
      } else {
        siteVisits.push({
          ...item,
          at: lead.appointmentAt,
          due: appointment,
          wait: `in ${formatWait(appointment - now)}`,
        });
      }
    } else if (!CLOSED.has(status) && lead.followUpDate) {
      // Leftover follow-up dates (e.g. imported leads) still raise their old alerts.
      const due = new Date(lead.followUpDate).getTime();
      if (due <= now) {
        urgent.push({ ...item, due, wait: `follow-up overdue ${formatWait(now - due)}` });
      } else if (due - now <= UPCOMING_DAYS * DAY_MS) {
        reminder.push({ ...item, due, wait: `follow-up in ${formatWait(due - now)}` });
      }
    }
    // Completed, Cancelled and Not Interested raise nothing.
  }

  const byDue = (a, b) => a.due - b.due;
  return {
    urgent: urgent.sort(byDue),
    reminder: reminder.sort(byDue),
    siteVisits: siteVisits.sort(byDue),
  };
}
