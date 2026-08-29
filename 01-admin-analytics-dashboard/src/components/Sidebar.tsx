import {
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";

type Props = {
  open: boolean;
  dark: boolean;
  activePage: string;
  onNavigate: (page: string) => void;
  onClose: () => void;
  onToggleTheme: () => void;
};

const links = [
  [LayoutDashboard, "Dashboard"],
  [BarChart3, "Analytics"],
  [Users, "Users"],
  [Boxes, "Products"],
  [FileText, "Reports"],
  [MessageSquare, "Messages"],
  [Settings, "Settings"],
] as const;

export default function Sidebar({
  open,
  dark,
  activePage,
  onNavigate,
  onClose,
  onToggleTheme,
}: Props) {
  const handleNavigation = (label: string) => {
    onNavigate(label);
    onClose();
  };

  return (
    <aside
      className={`sidebar surface p-4 ${
        open ? "open" : ""
      }`}
    >
      {/* =========================
          Brand
      ========================= */}

      <div className="flex items-center justify-between px-2 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 font-bold text-white">
            A
          </div>

          <div>
            <div className="font-bold text-main">
              AdminPro
            </div>

            <div className="text-xs muted">
              Analytics Suite
            </div>
          </div>
        </div>

        {/* Mobile close button */}

        <button
          onClick={onClose}
          className="rounded-lg p-2 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Close navigation menu"
        >
          <X size={19} />
        </button>
      </div>

      {/* =========================
          Navigation
      ========================= */}

      <nav
        className="mt-8 space-y-1"
        aria-label="Main navigation"
      >
        {links.map(([Icon, label]) => {
          const isActive =
            activePage === label;

          return (
            <button
              key={label}
              type="button"
              onClick={() =>
                handleNavigation(label)
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-current={
                isActive ? "page" : undefined
              }
            >
              <Icon size={19} />

              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* =========================
          Bottom Controls
      ========================= */}

      <div
        className="absolute bottom-4 left-4 right-4 space-y-1 border-t pt-4"
        style={{
          borderColor: "var(--border)",
        }}
      >
        {/* Theme Toggle */}

        <button
          type="button"
          onClick={onToggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-800"
          aria-label={
            dark
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {dark ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}

          <span>
            {dark
              ? "Light Mode"
              : "Dark Mode"}
          </span>
        </button>

        {/* Logout */}

        <button
          type="button"
          onClick={() =>
            alert(
              "Logout functionality will be connected to authentication later."
            )
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-800"
        >
          <LogOut size={19} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}