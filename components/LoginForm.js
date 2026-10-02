"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, Clock } from "lucide-react";
import { previewAgentAlerts, signIn } from "@/app/actions";

const inputClass =
  "mb-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none";
const primaryButtonClass =
  "mt-2 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60";

// OTP is switched off for now: a registered phone number signs in directly.
export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [alerts, setAlerts] = useState(null);
  const timer = useRef(null);
  const latest = useRef(0);

  // Once a full number is typed, look up that agent's alert counts.
  function handlePhoneChange(value) {
    setPhone(value);
    clearTimeout(timer.current);
    const id = ++latest.current;
    const digits = value.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 12) {
      setAlerts(null);
      return;
    }
    timer.current = setTimeout(async () => {
      const result = await previewAgentAlerts(value);
      if (id === latest.current) setAlerts(result);
    }, 400);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 12) {
      setError("Enter a valid phone number");
      return;
    }
    setPending(true);
    const result = await signIn(phone);
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-center text-lg font-medium text-gray-900">
          Agent CRM Dashboard
        </h1>
        <p className="mb-5 text-center text-sm text-gray-500">
          Sign in with your phone number
        </p>

        {alerts && alerts.urgent + alerts.reminder + alerts.siteVisits > 0 && (
          <div className="mb-5 flex flex-col items-center gap-2">
            {alerts.urgent > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700">
                <AlertTriangle size={13} />
                {alerts.urgent} waiting on you
              </span>
            )}
            {alerts.reminder > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                <Clock size={13} />
                {alerts.reminder} waiting on customer
              </span>
            )}
            {alerts.siteVisits > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                <CalendarClock size={13} />
                {alerts.siteVisits} upcoming site visit{alerts.siteVisits === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
          <label className="mb-1 block text-xs text-gray-500" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="012-345 6789"
            className={inputClass}
          />
          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
