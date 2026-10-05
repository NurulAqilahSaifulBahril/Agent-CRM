"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUpFirstAgent } from "@/app/actions";

const inputClass =
  "mb-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none";
const labelClass = "mb-1 block text-xs text-gray-500";
const primaryButtonClass =
  "mt-2 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60";

// Shown instead of sign-in while the app has no agents, so a new install
// can be set up on the spot.
export default function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    const result = await setUpFirstAgent(name, phone);
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
        <h1 className="mb-1 text-center text-lg font-medium text-gray-900">Set up Agent CRM</h1>
        <p className="mb-5 text-center text-sm text-gray-500">
          Add the first agent on this PC. They sign in with this phone number.
        </p>

        <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aisyah Rahman"
            className={inputClass}
          />
          <label className={`${labelClass} mt-3`} htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="012-345 6789"
            className={inputClass}
          />
          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? "Setting up…" : "Add agent and sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
