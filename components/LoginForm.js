"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { currentUser, initialUrgent, siteVisits } from "@/lib/mockData";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!password) {
      setError(true);
      return;
    }
    setError(false);
    router.push("/dashboard");
  }

  const nextVisit = siteVisits[0];
  const moreVisits = siteVisits.length - 1;

  return (
    <div className="flex justify-center py-12 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-center mb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-sm font-medium text-blue-700">
            {currentUser.initials}
          </div>
          <p className="text-base font-medium text-gray-900">Hi {currentUser.name}!</p>
          <p className="text-sm text-gray-500">{currentUser.email}</p>
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700">
            <AlertTriangle size={13} />
            {initialUrgent.length} urgent follow-ups
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
            <CalendarClock size={13} />
            Next visit: {nextVisit.when}
            {moreVisits > 0 && (
              <span className="text-[11px] text-blue-600">+{moreVisits} more</span>
            )}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
          <label className="mb-1 block text-xs text-gray-500" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mb-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
          {error && (
            <p className="mb-2 text-xs text-red-600">Enter your password</p>
          )}
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
