"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Home,
  MapPin,
  Sun,
  Zap,
  Battery,
  PlugZap,
  Package,
  Flag,
  UserPlus,
  Wallet,
  FileText,
  ClipboardCheck,
  CalendarClock,
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { STAGE_GROUPS, STAGE_STYLES, stageOf } from "@/lib/statusConfig";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { formatAppointment } from "@/lib/followUps";

const ACTIVITY_ICONS = { UserPlus, Flag, MessageCircle, Wallet, FileText, CalendarClock };
const APPOINTMENT = "Appointment Scheduled";

// <input type="datetime-local"> wants local time as "YYYY-MM-DDTHH:mm".
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const PACKAGE_ICONS = { Panel: Sun, Inverter: Zap, Battery, EV: PlugZap, Other: Package };

export default function LeadDetail({ leadId }) {
  const {
    leads,
    updateLeadStatus,
    scheduleAppointment,
    markFollowedUp,
    updateLeadRemark,
    updateLeadTotalPrice,
    updateLeadPaymentReceived,
  } = useCrm();
  const lead = leads.find((l) => l.id === leadId);
  const [stage, setStage] = useState("idle");
  // Choosing "Appointment Scheduled" asks for the visit time before saving anything.
  const [picking, setPicking] = useState(false);
  const [apptValue, setApptValue] = useState("");

  if (!lead) {
    return (
      <div>
        <p className="text-sm text-gray-500">Lead not found.</p>
        <Link href="/dashboard" className="text-sm text-blue-600">
          Back to leads
        </Link>
      </div>
    );
  }

  const totalPrice = Number(lead.totalPrice) || 0;
  const paymentReceived = Number(lead.paymentReceived) || 0;
  const paymentPercent =
    totalPrice > 0 ? Math.round((paymentReceived / totalPrice) * 100) : null;

  function handleOpenWhatsApp() {
    window.open(toWhatsAppLink(lead.phone), "_blank", "noopener,noreferrer");
    setStage("confirm");
  }

  function handleConfirmFollowedUp() {
    markFollowedUp(lead.id);
    setStage("idle");
  }

  const initials = lead.name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-md">
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={14} />
        Back to leads
      </Link>

      <div className="mb-3.5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-medium text-blue-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">{lead.name}</p>
          <p className="text-sm text-gray-500">{lead.phone || "No phone number on record"}</p>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${
            STAGE_STYLES[stageOf(lead.status)]
          }`}
        >
          {lead.status}
        </span>
      </div>

      {stage === "idle" ? (
        <button
          onClick={handleOpenWhatsApp}
          disabled={!lead.phone}
          className="mb-3.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageCircle size={16} /> Open WhatsApp
        </button>
      ) : (
        <div className="mb-3.5 rounded-md border border-gray-200 bg-gray-50 p-2.5">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-gray-600">
            <ExternalLink size={13} />
            WhatsApp opened for {lead.name}
          </p>
          <p className="mb-1.5 text-xs text-gray-500">Did you follow up?</p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmFollowedUp}
              className="flex-1 rounded-md border border-green-200 bg-green-50 py-1.5 text-sm text-green-700 hover:bg-green-100"
            >
              Mark as followed up
            </button>
            <button
              onClick={() => setStage("idle")}
              className="flex-1 rounded-md border border-gray-300 py-1.5 text-sm hover:bg-gray-100"
            >
              Not yet
            </button>
          </div>
        </div>
      )}

      <label className="mb-1 block text-xs text-gray-500" htmlFor="status">
        Follow-up status
      </label>
      <select
        id="status"
        value={picking ? APPOINTMENT : lead.status}
        onChange={(e) => {
          if (e.target.value === APPOINTMENT) {
            setApptValue(toLocalInput(lead.appointmentAt));
            setPicking(true);
            return;
          }
          setPicking(false);
          updateLeadStatus(lead.id, e.target.value);
        }}
        className="mb-3.5 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
      >
        {Object.entries(STAGE_GROUPS).map(([stageName, statuses]) => (
          <optgroup key={stageName} label={stageName}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {(picking || lead.status === APPOINTMENT) && (
        <div className="mb-3.5 rounded-md border border-blue-100 bg-blue-50 p-2.5">
          <label className="mb-1 flex items-center gap-1.5 text-xs text-blue-700" htmlFor="appointment">
            <CalendarClock size={13} />
            Site visit date &amp; time
          </label>
          {!picking && lead.appointmentAt && (
            <p suppressHydrationWarning className="mb-1.5 text-sm font-medium text-gray-900">
              {formatAppointment(lead.appointmentAt)}
            </p>
          )}
          <div className="flex gap-2">
            <input
              id="appointment"
              type="datetime-local"
              value={picking ? apptValue : toLocalInput(lead.appointmentAt)}
              onChange={(e) => {
                setApptValue(e.target.value);
                setPicking(true);
              }}
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-gray-400 focus:outline-none"
            />
            {picking && (
              <>
                <button
                  type="button"
                  disabled={!apptValue}
                  onClick={() => {
                    scheduleAppointment(lead.id, new Date(apptValue).toISOString());
                    setPicking(false);
                  }}
                  className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setPicking(false)}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-white"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <label className="mb-1 block text-xs text-gray-500" htmlFor="remark">
        Remark
      </label>
      <textarea
        id="remark"
        rows={2}
        defaultValue={lead.remark || ""}
        onBlur={(e) => updateLeadRemark(lead.id, e.target.value)}
        placeholder="Add a remark"
        className="mb-3.5 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
      />

      <div className="mb-3.5 border-t border-gray-100 pt-3">
        <div className="mb-1.5 flex gap-2">
          <Home size={15} className="mt-0.5 shrink-0 text-gray-400" />
          <p className="text-sm">{lead.address || "No address recorded"}</p>
        </div>
        <div className="flex gap-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
          <p className="text-sm">{lead.source}</p>
        </div>
      </div>

      {lead.invoiceNumber && (
        <div className="mb-3.5 border-t border-gray-100 pt-3">
          <div className="mb-1.5 flex gap-2">
            <FileText size={15} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-sm">
              Invoice {lead.invoiceNumber || "—"}
              {lead.invoiceStatus && (
                <span className="text-gray-500"> &middot; {lead.invoiceStatus}</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <ClipboardCheck size={15} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-sm">
              SEDA: {lead.sedaStatus || <span className="text-gray-400">No registration</span>}
            </p>
          </div>
        </div>
      )}

      <div className="mb-3.5 border-t border-gray-100 pt-3">
        <p className="mb-1.5 text-xs text-gray-500">Package</p>
        {lead.packageName ? (
          <div className="mb-1.5 flex items-start gap-2">
            <Package size={15} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-sm">{lead.packageName}</p>
          </div>
        ) : !lead.package || lead.package.length === 0 ? (
          <p className="text-sm text-gray-400">No package added yet</p>
        ) : (
          lead.package.map((item, i) => {
            const Icon = PACKAGE_ICONS[item.type] || Package;
            return (
              <div key={i} className="mb-1.5 flex items-start gap-2">
                <Icon size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <p className="text-sm">
                  {item.qty}x &middot; {item.desc}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="mb-3.5 border-t border-gray-100 pt-3">
        <p className="mb-1.5 text-xs text-gray-500">Payment</p>
        <div className="mb-2 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500" htmlFor="total-price">
              Total price (RM)
            </label>
            <input
              id="total-price"
              type="number"
              min="0"
              defaultValue={lead.totalPrice ?? ""}
              onBlur={(e) => updateLeadTotalPrice(lead.id, Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500" htmlFor="payment-received">
              Payment (RM)
            </label>
            <input
              id="payment-received"
              type="number"
              min="0"
              defaultValue={lead.paymentReceived ?? ""}
              onBlur={(e) =>
                updateLeadPaymentReceived(lead.id, Number(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md bg-gray-50 px-2.5 py-1.5">
          <span className="text-xs text-gray-500">Payment (%)</span>
          <span className="text-sm font-medium">
            {paymentPercent === null ? "—" : `${paymentPercent}%`}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="mb-1.5 text-xs text-gray-500">Activity</p>
        <div className="flex flex-col gap-2">
          {(lead.activity || []).map((a, i) => {
            const Icon = ACTIVITY_ICONS[a.icon] || Flag;
            return (
              <div key={i} className="flex items-start gap-2">
                <Icon size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm">{a.text}</p>
                  <p className="text-[11px] text-gray-400">{a.when}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
