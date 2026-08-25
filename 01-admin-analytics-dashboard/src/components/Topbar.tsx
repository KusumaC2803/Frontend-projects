import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { notifications } from "../data";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  return (
    <header className="surface sticky top-0 z-20 border-x-0 border-t-0 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" aria-label="Open menu"><Menu size={22}/></button>
        <div className="relative flex-1 max-w-xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 muted" />
          <input placeholder="Search anything..." className="h-11 w-full rounded-xl border bg-transparent pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ borderColor: "var(--border)" }} />
        </div>
        <div className="relative">
          <button onClick={() => setShowNotifications((v) => !v)} className="relative rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notifications">
            <Bell size={20}/>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"/>
          </button>
          {showNotifications && (
            <div className="surface absolute right-0 top-14 z-50 w-80 rounded-2xl p-4 shadow-xl">
              <div className="mb-3 font-semibold text-main">Notifications</div>
              {notifications.map((n) => <div key={n} className="border-b py-3 text-sm last:border-0 muted" style={{ borderColor: "var(--border)" }}>{n}</div>)}
            </div>
          )}
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 font-bold text-white">KC</div>
          <div><div className="text-sm font-semibold text-main">Kusuma C</div><div className="text-xs muted">Administrator</div></div>
        </div>
      </div>
    </header>
  );
}