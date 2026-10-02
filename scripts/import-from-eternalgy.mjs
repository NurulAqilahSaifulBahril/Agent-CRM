// One-time copy of agents and their leads from the Eternalgy API into the
// CRM's own data file (data/crm.json). Run it once, then delete it and the
// ETERNALGY_* lines in .env.local:
//
//   node --env-file=.env.local scripts/import-from-eternalgy.mjs
//
// It refuses to overwrite an existing data file unless you pass --force.
// Add --phone 012-345 6789 to import only that one agent and their leads.

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PAGE_SIZE = 100;
const phoneArg = process.argv.includes("--phone")
  ? process.argv[process.argv.indexOf("--phone") + 1]
  : null;
const onlyPhone = phoneArg ? normalizePhone(phoneArg) : null;

// Compare Malaysian numbers regardless of formatting or a leading 60.
function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.startsWith("60") ? "0" + digits.slice(2) : digits;
}

const OUT = process.env.CRM_DATA_FILE || path.join(process.cwd(), "data", "crm.json");

const baseUrl = (process.env.ETERNALGY_API_URL || "").replace(/\/$/, "");
const password = process.env.ETERNALGY_API_PASSWORD;
if (!baseUrl || !password) {
  console.error("ETERNALGY_API_URL and ETERNALGY_API_PASSWORD must be set in .env.local");
  process.exit(1);
}
if (existsSync(OUT) && !process.argv.includes("--force")) {
  console.error(`${OUT} already exists. Pass --force to overwrite it.`);
  process.exit(1);
}

function toNameCase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s\-'])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

async function apiGet(route) {
  const res = await fetch(baseUrl + route, { headers: { "X-Api-Password": password } });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(`Eternalgy API ${route} failed: ${res.status} ${body?.error || ""}`.trim());
  }
  return body.data;
}

async function fetchAll(resource) {
  const rows = [];
  const batch = 10;
  for (let start = 0; ; start += batch) {
    const pages = await Promise.all(
      Array.from({ length: batch }, (_, i) =>
        apiGet(`/${resource}?limit=${PAGE_SIZE}&offset=${(start + i) * PAGE_SIZE}`)
      )
    );
    for (const page of pages) rows.push(...page);
    if (pages.some((page) => page.length < PAGE_SIZE)) return rows;
  }
}

function initialStatus(total, paid) {
  if (total > 0 && paid >= total) return "Completed";
  if (paid > 0) return "Confirmed";
  return "New Lead";
}

console.log("Reading users, invoices, SEDA registrations and payments…");
const [users, invoices, sedaRows, payments] = await Promise.all([
  fetchAll("users"),
  fetchAll("invoices"),
  fetchAll("seda"),
  fetchAll("payments"),
]);

// Only users linked to an agent profile can sign in and own leads.
const agents = users
  .filter((u) => u.linked_agent_profile)
  .filter((u) => !onlyPhone || normalizePhone(u.contact) === onlyPhone)
  .map((u) => ({
    id: u.bubble_id,
    profileId: u.linked_agent_profile,
    name: toNameCase(u.name),
    phone: u.contact || "",
  }));
const ownerByProfile = new Map(agents.map((a) => [a.profileId, a.id]));

const sedaById = new Map(sedaRows.map((s) => [s.bubble_id, s]));
const paymentById = new Map(payments.map((p) => [p.bubble_id, p]));
const paymentsByInvoice = new Map();
for (const p of payments) {
  if (!paymentsByInvoice.has(p.linked_invoice)) paymentsByInvoice.set(p.linked_invoice, []);
  paymentsByInvoice.get(p.linked_invoice).push(p);
}

const leads = invoices
  .filter(
    (inv) =>
      ownerByProfile.has(inv.linked_agent) &&
      inv.is_latest !== false &&
      !inv.is_deleted &&
      inv.status !== "deleted"
  )
  .map((inv) => {
    const seda = inv.linked_seda_registration ? sedaById.get(inv.linked_seda_registration) : null;
    const own = new Map((paymentsByInvoice.get(inv.bubble_id) || []).map((p) => [p.bubble_id, p]));
    for (const id of inv.linked_payment || []) {
      if (paymentById.has(id)) own.set(id, paymentById.get(id));
    }
    const paymentList = [...own.values()].sort(
      (a, b) =>
        new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at)
    );
    const total = Number(inv.total_amount) || 0;
    const paid = paymentList.length
      ? paymentList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      : Number(inv.paid_amount) || 0;
    const created = inv.invoice_date || inv.created_at;

    return {
      id: inv.bubble_id,
      agentId: ownerByProfile.get(inv.linked_agent),
      name: toNameCase(seda?.applicant_name || inv.customer_name_snapshot) || "Unnamed customer",
      phone: seda?.applicant_phone || inv.customer_phone_snapshot || "",
      address: inv.customer_address_snapshot || seda?.installation_address || "",
      source: inv.lead_source || "—",
      status: initialStatus(total, paid),
      createdAt: created,
      updatedAt: inv.updated_at || created,
      followUpDate: inv.follow_up_date || null,
      invoiceNumber: inv.invoice_number,
      invoiceStatus: inv.status,
      sedaStatus: seda?.seda_status || null,
      packageName: inv.package_name_snapshot,
      totalPrice: total,
      paymentReceived: paid,
      activity: [
        ...paymentList.map((p) => ({
          icon: "Wallet",
          text: `Payment of RM ${(Number(p.amount) || 0).toLocaleString("en-MY")} received${
            p.payment_method ? ` (${p.payment_method})` : ""
          }`,
          at: p.payment_date || p.created_at,
        })),
        {
          icon: "FileText",
          text: `Invoice ${inv.invoice_number || ""} created`.replace("  ", " "),
          at: created,
        },
      ],
    };
  });

const data = {
  agents: agents.map(({ profileId, ...agent }) => agent),
  leads,
};
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(data, null, 2));
console.log(`Saved ${data.agents.length} agents and ${leads.length} leads to ${OUT}`);
