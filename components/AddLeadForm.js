"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Check } from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { referralSources } from "@/lib/mockData";

const TYPES = ["Panel", "Inverter", "Battery", "EV", "Other"];
const OTHER_SOURCE = "__other__";

function newRow() {
  return { key: Math.random().toString(36).slice(2), qty: 1, type: "Panel", desc: "" };
}

export default function AddLeadForm() {
  const { addLead } = useCrm();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [source, setSource] = useState(referralSources[0]);
  const [customSource, setCustomSource] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [rows, setRows] = useState([
    { key: "seed-1", qty: 15, type: "Panel", desc: "650W JinkoSolar TIGER NEO 3.0 N-Type TOPCon" },
    { key: "seed-2", qty: 1, type: "Inverter", desc: "[1P] SAJ H2 6KW Single Phase Hybrid" },
  ]);
  const [errors, setErrors] = useState({});
  const [savedLead, setSavedLead] = useState(null);

  function updateRow(key, patch) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Enter a name";
    if (!phone.trim()) nextErrors.phone = "Enter a phone number";
    if (source === OTHER_SOURCE && !customSource.trim())
      nextErrors.source = "Enter a referral source";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const lead = addLead({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      source: source === OTHER_SOURCE ? customSource.trim() : source,
      package: rows.map(({ qty, type, desc }) => ({ qty: Number(qty) || 1, type, desc })),
      totalPrice: totalPrice === "" ? undefined : Number(totalPrice),
    });
    setSavedLead(lead);
  }

  if (savedLead) {
    return (
      <div className="max-w-md py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
          <Check size={20} />
        </div>
        <p className="mb-1 font-medium text-gray-900">Lead added</p>
        <p className="mb-4 text-sm text-gray-500">
          {savedLead.name} &middot; {savedLead.package.length} package item
          {savedLead.package.length === 1 ? "" : "s"}
        </p>
        <div className="flex justify-center gap-2">
          <Link
            href={`/dashboard/leads/${savedLead.id}`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            View lead
          </Link>
          <Link
            href="/dashboard/leads/new"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Add another
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <p className="mb-3.5 text-base font-medium">Add new lead</p>

      <label className="mb-1 block text-xs text-gray-500" htmlFor="name">
        Name
      </label>
      <input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Aisyah Rahman"
        className="mb-0.5 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
      />
      {errors.name && <p className="mb-2 text-xs text-red-600">{errors.name}</p>}

      <label className="mb-1 mt-2 block text-xs text-gray-500" htmlFor="phone">
        Phone number
      </label>
      <input
        id="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="012-345 6789"
        className="mb-0.5 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
      />
      {errors.phone && <p className="mb-2 text-xs text-red-600">{errors.phone}</p>}

      <label className="mb-1 mt-2 block text-xs text-gray-500" htmlFor="address">
        Address
      </label>
      <textarea
        id="address"
        rows={2}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="No 12, Jalan Aman 3, Taman Aman, 43000 Kajang, Selangor"
        className="mb-3 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
      />

      <div className="mb-3.5">
        <label className="mb-1 block text-xs text-gray-500" htmlFor="source">
          Referral source
        </label>
        <select
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
        >
          {referralSources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value={OTHER_SOURCE}>Others</option>
        </select>
        {source === OTHER_SOURCE && (
          <input
            type="text"
            value={customSource}
            onChange={(e) => setCustomSource(e.target.value)}
            placeholder="Enter referral source"
            className="mt-1.5 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        )}
        {errors.source && <p className="mt-1 text-xs text-red-600">{errors.source}</p>}
      </div>

      <p className="mb-1.5 text-xs text-gray-500">Package</p>
      <div className="mb-1.5 flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              value={row.qty}
              onChange={(e) => updateRow(row.key, { qty: e.target.value })}
              className="w-14 shrink-0 rounded-md border border-gray-300 px-1.5 py-1 text-sm focus:border-gray-400 focus:outline-none"
            />
            <select
              value={row.type}
              onChange={(e) => updateRow(row.key, { type: e.target.value })}
              className="w-24 shrink-0 rounded-md border border-gray-300 px-1.5 py-1 text-sm focus:border-gray-400 focus:outline-none"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={row.desc}
              onChange={(e) => updateRow(row.key, { desc: e.target.value })}
              placeholder="Model / spec"
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-400 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Remove component"
              onClick={() => removeRow(row.key)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, newRow()])}
        className="mb-3.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-50"
      >
        + Add component
      </button>

      <label className="mb-1 block text-xs text-gray-500" htmlFor="total-price">
        Total price (RM)
      </label>
      <input
        id="total-price"
        type="number"
        min="0"
        value={totalPrice}
        onChange={(e) => setTotalPrice(e.target.value)}
        placeholder="0"
        className="mb-4 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
      />

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-3.5">
        <Link
          href="/dashboard"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Save lead
        </button>
      </div>
    </form>
  );
}
