"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { initialUrgent, siteVisits } from "@/lib/mockData";

const inputClass =
  "mb-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none";
const primaryButtonClass =
  "mt-2 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [error, setError] = useState("");

  function handleSendOtp(e) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 12) {
      setError("Enter a valid phone number");
      return;
    }
    setError("");
    setSentCode(generateOtp());
    setStep("otp");
  }

  function handleVerify(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    if (otp !== sentCode) {
      setError("That code doesn't match. Try again.");
      return;
    }
    router.push("/dashboard");
  }

  function handleResend() {
    setSentCode(generateOtp());
    setOtp("");
    setError("");
  }

  function handleChangeNumber() {
    setStep("phone");
    setOtp("");
    setSentCode("");
    setError("");
  }

  const nextVisit = siteVisits[0];
  const moreVisits = siteVisits.length - 1;

  return (
    <div className="flex justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-center text-lg font-medium text-gray-900">
          Agent CRM Dashboard
        </h1>
        <p className="mb-4 text-center text-sm text-gray-500">
          {step === "phone"
            ? "Sign in with your phone number"
            : `Enter the 6-digit code sent to ${phone}`}
        </p>

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

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="border-t border-gray-100 pt-4">
            <label className="mb-1 block text-xs text-gray-500" htmlFor="phone">
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
            <button type="submit" className={primaryButtonClass}>
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="border-t border-gray-100 pt-4">
            <div className="mb-3 rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Demo mode: no SMS is sent. Your code is{" "}
              <span className="font-medium tracking-widest">{sentCode}</span>
            </div>
            <label className="mb-1 block text-xs text-gray-500" htmlFor="otp">
              One-time code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className={`${inputClass} tracking-widest`}
            />
            {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
            <button type="submit" className={primaryButtonClass}>
              Verify and sign in
            </button>
            <div className="mt-3 flex justify-between text-xs">
              <button
                type="button"
                onClick={handleChangeNumber}
                className="text-gray-500 hover:text-gray-700"
              >
                Change number
              </button>
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-700"
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
