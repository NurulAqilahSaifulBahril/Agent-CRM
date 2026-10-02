import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CrmProvider } from "@/context/CrmContext";
import TopBar from "@/components/TopBar";
import NotificationPanel from "@/components/NotificationPanel";
import { findUserById, getLeadsForAgent, serverTime } from "@/lib/store";
import { getSessionUserId } from "@/lib/session";

function Frame({ children }) {
  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {children}
      </div>
    </div>
  );
}

async function Dashboard({ children }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  let user;
  let leads;
  try {
    user = await findUserById(userId);
    if (user) leads = await getLeadsForAgent(user.id);
  } catch (err) {
    console.error(err);
    return (
      <Frame>
        <p className="p-6 text-sm text-red-600">
          Couldn&apos;t load your leads. Refresh to try again.
        </p>
      </Frame>
    );
  }
  if (!user) redirect("/");

  // Read here, not in the JSX, so alerts first render with the server's clock.
  const now = serverTime();

  return (
    <CrmProvider user={user} initialLeads={leads} initialNow={now}>
      <Frame>
        <TopBar />
        <div className="flex">
          <NotificationPanel />
          <div className="min-w-0 flex-1 p-4">{children}</div>
        </div>
      </Frame>
    </CrmProvider>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense
      fallback={
        <Frame>
          <p className="p-6 text-sm text-gray-500">Loading your leads…</p>
        </Frame>
      }
    >
      <Dashboard>{children}</Dashboard>
    </Suspense>
  );
}
