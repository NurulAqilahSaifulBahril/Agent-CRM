"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Bot, BarChart3, LogOut } from "lucide-react";
import { currentUser } from "@/lib/mockData";

export default function TopBar() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" aria-label="Dashboard" className="text-blue-600">
          <LayoutDashboard size={19} />
        </Link>
        <Link href="/dashboard" aria-label="Leads" className="text-gray-500 hover:text-gray-700">
          <Users size={19} />
        </Link>
        <span aria-label="Automation" className="text-gray-300">
          <Bot size={19} />
        </span>
        <span aria-label="Reports" className="text-gray-300">
          <BarChart3 size={19} />
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Hi {currentUser.name}!</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-700">
          {currentUser.initials}
        </div>
        <button
          aria-label="Sign out"
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-gray-700"
        >
          <LogOut size={17} />
        </button>
      </div>
    </div>
  );
}
