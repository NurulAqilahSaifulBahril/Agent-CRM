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
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { STAGE_GROUPS, STAGE_STYLES, stageOf } from "@/lib/statusConfig";
import { toWhatsAppLink } from "@/lib/whatsapp";

const ACTIVITY_ICONS = { UserPlus, Flag, MessageCircle };
const PACKAGE_ICONS = { Panel: Sun, Inverter: Zap, Battery, EV: PlugZap, Other: Package };

export default function LeadDetail({ leadId }) {
  const {
    leads,
    updateLeadStatus,
    markFollowedUp,
    updateLeadRemark,
    updateLeadTotalPrice,
    updateLeadPaymentReceived,
  } = useCrm();
  const lead = leads.find((l) => l.id === leadId);
  const [stage, setStage] = useState("idle");

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
          <p className="text-sm text-gray-500">{lead.phone}</p>
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
          className="mb-3.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 py-2 text-sm hover:bg-gray-50"
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
        value={lead.status}
        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
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

      <div className="mb-3.5 border-t border-gray-100 pt-3">
        <p className="mb-1.5 text-xs text-gray-500">Package</p>
        {!lead.package || lead.package.length === 0 ? (
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
