"use server";

import {
  addFirstAgent,
  createLead,
  deleteLead,
  findUserById,
  findUserByPhone,
  getLeadsForAgent,
  logFollowUp,
  updateLead,
  serverTime,
} from "@/lib/store";
import { buildNotifications } from "@/lib/followUps";
import { createSession, deleteSession, getSessionUserId } from "@/lib/session";

// Counts shown on the sign-in page once a registered number is typed.
export async function previewAgentAlerts(phone) {
  try {
    const user = await findUserByPhone(phone);
    if (!user) return null;
    const { urgent, reminder, siteVisits } = buildNotifications(
      await getLeadsForAgent(user.id),
      serverTime()
    );
    return { urgent: urgent.length, reminder: reminder.length, siteVisits: siteVisits.length };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function signIn(phone) {
  const user = await findUserByPhone(phone);
  if (!user) return { ok: false, error: "No agent account uses this number" };
  await createSession(user.id);
  return { ok: true };
}

// Sets up a new install: adds the first agent and signs them in.
export async function setUpFirstAgent(name, phone) {
  const cleanName = String(name || "").trim();
  const cleanPhone = String(phone || "").trim();
  const digits = cleanPhone.replace(/\D/g, "");
  if (!cleanName) return { ok: false, error: "Enter the agent's name" };
  if (digits.length < 9 || digits.length > 12) {
    return { ok: false, error: "Enter a valid phone number" };
  }
  const agent = await addFirstAgent(cleanName, cleanPhone);
  if (!agent) return { ok: false, error: "This PC is already set up. Reload to sign in." };
  await createSession(agent.id);
  return { ok: true };
}

export async function signOut() {
  await deleteSession();
}

// Lead edits only apply to the signed-in agent's own leads.
async function currentAgentId() {
  const userId = await getSessionUserId();
  const user = userId && (await findUserById(userId));
  if (!user) throw new Error("Not signed in");
  return user.id;
}

export async function addLeadAction(data) {
  const agentId = await currentAgentId();
  return createLead(agentId, {
    name: String(data.name || "").trim(),
    phone: String(data.phone || "").trim(),
    address: String(data.address || "").trim(),
    source: String(data.source || "").trim(),
    package: Array.isArray(data.package) ? data.package : [],
    totalPrice: Number.isFinite(data.totalPrice) ? data.totalPrice : undefined,
  });
}

export async function updateLeadAction(leadId, patch) {
  const agentId = await currentAgentId();
  return updateLead(agentId, leadId, patch);
}

export async function logFollowUpAction(leadId) {
  const agentId = await currentAgentId();
  return logFollowUp(agentId, leadId);
}

export async function deleteLeadAction(leadId) {
  const agentId = await currentAgentId();
  return deleteLead(agentId, leadId);
}
