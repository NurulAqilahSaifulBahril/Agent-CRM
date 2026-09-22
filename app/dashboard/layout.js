import { CrmProvider } from "@/context/CrmContext";
import TopBar from "@/components/TopBar";
import NotificationPanel from "@/components/NotificationPanel";

export default function DashboardLayout({ children }) {
  return (
    <CrmProvider>
      <div className="mx-auto w-full max-w-5xl p-4">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <TopBar />
          <div className="flex">
            <NotificationPanel />
            <div className="min-w-0 flex-1 p-4">{children}</div>
          </div>
        </div>
      </div>
    </CrmProvider>
  );
}
