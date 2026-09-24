"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut } from "lucide-react";
import { currentUser } from "@/lib/mockData";

export default function TopBar() {
  const router = useRouter();
  const onHome = usePathname() === "/dashboard";

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
      <Link
        href="/dashboard"
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium ${
          onHome ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Home size={16} />
        Home
      </Link>
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
