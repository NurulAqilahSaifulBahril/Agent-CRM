// Signed session cookie holding the signed-in agent's ID.
// Server-only: uses node crypto and the session secret.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "crm_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET must be set");
  return value;
}

function sign(userId) {
  return createHmac("sha256", secret()).update(userId).digest("base64url");
}

export async function createSession(userId) {
  const store = await cookies();
  store.set(COOKIE, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getSessionUserId() {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  const userId = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1));
  const expected = Buffer.from(sign(userId));
  if (dot < 1 || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }
  return userId;
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
