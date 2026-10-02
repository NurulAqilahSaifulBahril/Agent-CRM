// Server-side storage for agents and leads: one JSON file, no outside service.
// Set CRM_DATA_FILE to keep it on a persistent disk (e.g. a Railway volume).
// Never import this from a client component.

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { formatAgo, formatWhen } from "./formatDate";
import { toNameCase } from "./formatText";

const DATA_FILE = process.env.CRM_DATA_FILE || path.join(process.cwd(), "data", "crm.json");

// Reads and writes run one at a time so two saves can't overwrite each other.
let queue = Promise.resolve();

function exclusive(task) {
  const run = queue.then(task);
  queue = run.catch(() => {});
  return run;
}

async function load() {
  try {
    return JSON.parse(await readFile(/* turbopackIgnore: true */ DATA_FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return { agents: [], leads: [] };
    throw err;
  }
}

async function save(data) {
  await mkdir(/* turbopackIgnore: true */ path.dirname(DATA_FILE), { recursive: true });
  const temp = `${DATA_FILE}.tmp`;
  await writeFile(/* turbopackIgnore: true */ temp, JSON.stringify(data, null, 2));
  await rename(/* turbopackIgnore: true */ temp, /* turbopackIgnore: true */ DATA_FILE);
}

// The server's clock, handed to the page so alerts first render with matching times.
export function serverTime() {
  return Date.now();
}

const APP_LEAD_PREFIX = "lead-";

// Compare Malaysian numbers regardless of formatting or a leading 60.
export function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.startsWith("60") ? "0" + digits.slice(2) : digits;
}

// Times are stored as ISO strings and turned into "5m ago" labels on the way out.
function present(lead) {
  const { agentId, ...rest } = lead;
  return {
    ...rest,
    // Only leads made in this app can be deleted; imported ones keep their invoice record.
    deletable: lead.id.startsWith(APP_LEAD_PREFIX),
    lastActivity: formatAgo(lead.updatedAt || lead.createdAt),
    activity: (lead.activity || []).map((a) => ({ ...a, when: formatWhen(a.at) })),
  };
}

function entry(icon, text) {
  return { icon, text, at: new Date().toISOString() };
}

export async function findUserByPhone(phone) {
  const wanted = normalizePhone(phone);
  if (wanted.length < 9) return null;
  const { agents } = await exclusive(load);
  return agents.find((a) => normalizePhone(a.phone) === wanted) || null;
}

export async function findUserById(id) {
  const { agents } = await exclusive(load);
  return agents.find((a) => a.id === id) || null;
}

export async function getLeadsForAgent(agentId) {
  const { leads } = await exclusive(load);
  return leads.filter((l) => l.agentId === agentId).map(present);
}

export function createLead(agentId, data) {
  return exclusive(async () => {
    const db = await load();
    const now = new Date().toISOString();
    const lead = {
      id: `${APP_LEAD_PREFIX}${randomUUID()}`,
      agentId,
      name: toNameCase(data.name),
      phone: data.phone,
      address: data.address,
      source: data.source,
      status: "New Lead",
      statusChangedAt: now,
      createdAt: now,
      updatedAt: now,
      package: data.package,
      totalPrice: data.totalPrice,
      paymentReceived: 0,
      activity: [entry("UserPlus", `Lead created via ${data.source}`)],
    };
    db.leads.unshift(lead);
    await save(db);
    return present(lead);
  });
}

// Only these fields can be edited from the app.
const EDITABLE = ["status", "remark", "totalPrice", "paymentReceived", "appointmentAt"];

export function updateLead(agentId, leadId, patch) {
  return exclusive(async () => {
    const db = await load();
    const lead = db.leads.find((l) => l.id === leadId && l.agentId === agentId);
    if (!lead) return null;
    for (const key of EDITABLE) {
      if (!(key in patch)) continue;
      if (key === "appointmentAt" && Number.isNaN(new Date(patch.appointmentAt).getTime())) {
        continue;
      }
      if (key === "status" && patch.status !== lead.status) {
        lead.activity = [entry("Flag", `Status changed to ${patch.status}`), ...(lead.activity || [])];
        lead.statusChangedAt = new Date().toISOString();
      }
      if (key === "appointmentAt" && lead.appointmentAt && patch.appointmentAt !== lead.appointmentAt) {
        lead.activity = [entry("CalendarClock", "Appointment rescheduled"), ...(lead.activity || [])];
      }
      lead[key] = patch[key];
    }
    lead.updatedAt = new Date().toISOString();
    await save(db);
    return present(lead);
  });
}

export function logFollowUp(agentId, leadId) {
  return exclusive(async () => {
    const db = await load();
    const lead = db.leads.find((l) => l.id === leadId && l.agentId === agentId);
    if (!lead) return null;
    lead.activity = [
      entry("MessageCircle", "Marked as followed up via WhatsApp"),
      ...(lead.activity || []),
    ];
    lead.updatedAt = new Date().toISOString();
    await save(db);
    return present(lead);
  });
}

export function deleteLead(agentId, leadId) {
  return exclusive(async () => {
    const db = await load();
    const index = db.leads.findIndex((l) => l.id === leadId && l.agentId === agentId);
    if (index === -1 || !db.leads[index].id.startsWith(APP_LEAD_PREFIX)) return false;
    db.leads.splice(index, 1);
    await save(db);
    return true;
  });
}
