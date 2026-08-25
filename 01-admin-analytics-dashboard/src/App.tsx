import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Package,
  Settings,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { analyticsPeriods } from "./data";
import Sidebar from "./components/Sidebar";
import MetricCard from "./components/MetricCard";
import RevenueChart from "./components/RevenueChart";
import SalesCategoryChart from "./components/SalesCategoryChart";
import ActivityTable from "./components/ActivityTable";
import Topbar from "./components/Topbar";

type Period = keyof typeof analyticsPeriods;

function App() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [period, setPeriod] =
    useState<Period>("Last 30 days");

  const [showPeriods, setShowPeriods] =
    useState(false);

  const [toast, setToast] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    localStorage.setItem(
      "theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  const selectedData =
    analyticsPeriods[period];

  const totalRevenue = selectedData.reduce(
    (total, item) => total + item.revenue,
    0
  );

  const totalUsers = selectedData.reduce(
    (total, item) => total + item.users,
    0
  );

  const totalOrders = Math.round(
    totalRevenue / 150
  );

  const conversionRate =
    totalUsers > 0
      ? (totalOrders / totalUsers) * 100
      : 0;

  const showToast = (
    message: string,
    duration = 2500
  ) => {
    setToast(message);

    window.setTimeout(() => {
      setToast(null);
    }, duration);
  };

  const handleNavigation = (
    page: string
  ) => {
    setActivePage(page);
    setMenuOpen(false);
    setShowPeriods(false);

    if (page !== "Dashboard") {
      showToast(`${page} opened.`);
    }
  };

  const handlePeriodChange = (
    option: Period
  ) => {
    setShowPeriods(false);
    setLoading(true);

    window.setTimeout(() => {
      setPeriod(option);
      setLoading(false);

      showToast(
        `Analytics updated for ${option}.`
      );
    }, 400);
  };

  const handleExport = () => {
    const data = analyticsPeriods[period];

    const csv = [
      ["Period", "Revenue", "Users"].join(","),
      ...data.map((item) =>
        [
          item.month,
          item.revenue,
          item.users,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `admin-analytics-${period
        .toLowerCase()
        .replace(/ /g, "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(
      `Analytics exported for ${period}.`,
      3000
    );
  };

  const pageDescription: Record<
    string,
    string
  > = {
    Dashboard:
      "Here is what's happening with your business today.",
    Analytics:
      "Monitor business performance, growth and customer activity.",
    Users:
      "Manage users, memberships and account activity.",
    Products:
      "Track products, inventory and product performance.",
    Reports:
      "Review generated reports and business summaries.",
    Messages:
      "Monitor customer communication and recent messages.",
    Settings:
      "Manage dashboard preferences and application settings.",
  };

  return (
    <div
      className={`app-shell ${
        dark ? "dark" : ""
      }`}
    >
      {/* Loading */}

      {loading && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/20 backdrop-blur-[2px]">
          <div className="surface rounded-2xl px-6 py-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />

              <span className="text-sm font-medium text-main">
                Updating analytics...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}

      {toast && (
        <div
          className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="surface flex items-start gap-3 rounded-2xl border p-4 shadow-xl">
            <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-main">
                Success
              </p>

              <p className="mt-1 text-sm muted">
                {toast}
              </p>
            </div>

            <button
              onClick={() => setToast(null)}
              className="rounded-lg p-1 muted hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close notification"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}

      <Sidebar
        open={menuOpen}
        dark={dark}
        activePage={activePage}
        onNavigate={handleNavigation}
        onClose={() => setMenuOpen(false)}
        onToggleTheme={() =>
          setDark((value) => !value)
        }
      />

      {/* Main */}

      <div className="main-area">
        <Topbar
          onMenu={() => setMenuOpen(true)}
        />

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6">

          {/* Header */}

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium primary">
                {activePage}
              </p>

              <h1 className="mt-1 text-2xl font-bold text-main sm:text-3xl">
                {activePage === "Dashboard"
                  ? "Good morning, Kusuma 👋"
                  : activePage}
              </h1>

              <p className="mt-1 text-sm muted">
                {pageDescription[activePage]}
              </p>
            </div>

            {activePage === "Dashboard" && (
              <div className="flex flex-wrap gap-2">

                {/* Period */}

                <div className="relative">
                  <button
                    onClick={() =>
                      setShowPeriods(
                        (value) => !value
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium text-main hover:bg-slate-100 dark:hover:bg-slate-800"
                    style={{
                      borderColor:
                        "var(--border)",
                    }}
                    aria-expanded={
                      showPeriods
                    }
                  >
                    <CalendarDays size={17} />
                    {period}
                  </button>

                  {showPeriods && (
                    <div className="surface absolute right-0 top-12 z-30 w-48 rounded-xl p-2 shadow-xl">
                      {(
                        Object.keys(
                          analyticsPeriods
                        ) as Period[]
                      ).map((option) => (
                        <button
                          key={option}
                          onClick={() =>
                            handlePeriodChange(
                              option
                            )
                          }
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                            period === option
                              ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/40"
                              : "text-main"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export */}

                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <Download size={17} />
                  Export
                </button>
              </div>
            )}
          </div>

          {/* =================================
              DASHBOARD
          ================================= */}

          {activePage === "Dashboard" && (
            <>
              {/* KPI */}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  metric={{
                    label: "Total Revenue",
                    value: `$${totalRevenue.toLocaleString()}`,
                    change: "+12.5%",
                    positive: true,
                  }}
                  index={0}
                />

                <MetricCard
                  metric={{
                    label: "Active Users",
                    value:
                      totalUsers.toLocaleString(),
                    change: "+8.2%",
                    positive: true,
                  }}
                  index={1}
                />

                <MetricCard
                  metric={{
                    label: "Orders",
                    value:
                      totalOrders.toLocaleString(),
                    change: "+5.7%",
                    positive: true,
                  }}
                  index={2}
                />

                <MetricCard
                  metric={{
                    label: "Conversion Rate",
                    value: `${conversionRate.toFixed(
                      2
                    )}%`,
                    change: "-0.6%",
                    positive: false,
                  }}
                  index={3}
                />
              </section>

              {/* Charts */}

              <section className="mt-4 grid gap-4 lg:grid-cols-3">
                <RevenueChart
                  data={selectedData}
                />

                <SalesCategoryChart />

                <div className="surface rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-main">
                        Monthly Target
                      </h2>

                      <p className="text-sm muted">
                        August 2026
                      </p>
                    </div>

                    <Target
                      className="primary"
                      size={21}
                    />
                  </div>

                  <div className="mt-8 text-center">
                    <div className="text-4xl font-bold text-main">
                      82%
                    </div>

                    <p className="mt-1 text-sm muted">
                      $54,000 of $66,000
                    </p>
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[82%] rounded-full bg-indigo-600" />
                  </div>

                  <div className="mt-5 flex justify-between text-sm">
                    <span className="muted">
                      Remaining
                    </span>

                    <span className="font-semibold text-main">
                      $12,000
                    </span>
                  </div>
                </div>
              </section>

              {/* Activity */}

              <section className="mt-4 grid gap-4 xl:grid-cols-3">
                <ActivityTable />

                <QuickInsights />
              </section>
            </>
          )}

          {/* =================================
              ANALYTICS
          ================================= */}

          {activePage === "Analytics" && (
            <AnalyticsPage
              selectedData={selectedData}
              totalRevenue={totalRevenue}
              totalUsers={totalUsers}
              conversionRate={conversionRate}
            />
          )}

          {/* =================================
              USERS
          ================================= */}

          {activePage === "Users" && (
            <UsersPage />
          )}

          {/* =================================
              PRODUCTS
          ================================= */}

          {activePage === "Products" && (
            <ProductsPage />
          )}

          {/* =================================
              REPORTS
          ================================= */}

          {activePage === "Reports" && (
            <ReportsPage
              onExport={handleExport}
            />
          )}

          {/* =================================
              MESSAGES
          ================================= */}

          {activePage === "Messages" && (
            <MessagesPage />
          )}

          {/* =================================
              SETTINGS
          ================================= */}

          {activePage === "Settings" && (
            <SettingsPage
              dark={dark}
              onToggleTheme={() =>
                setDark(
                  (value) => !value
                )
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ==========================================
   ANALYTICS PAGE
========================================== */

function AnalyticsPage({
  selectedData,
  totalRevenue,
  totalUsers,
  conversionRate,
}: {
  selectedData: typeof analyticsPeriods[keyof typeof analyticsPeriods];
  totalRevenue: number;
  totalUsers: number;
  conversionRate: number;
}) {
  return (
    <div className="space-y-4">

      <div className="grid gap-4 md:grid-cols-3">

        <AnalyticsStat
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+12.5%"
          positive
          icon={<TrendingUp size={21} />}
        />

        <AnalyticsStat
          title="Users"
          value={totalUsers.toLocaleString()}
          change="+8.2%"
          positive
          icon={<Users size={21} />}
        />

        <AnalyticsStat
          title="Conversion"
          value={`${conversionRate.toFixed(2)}%`}
          change="-0.6%"
          positive={false}
          icon={<Target size={21} />}
        />

      </div>

      <div className="grid gap-4 lg:grid-cols-2">

        <RevenueChart
          data={selectedData}
        />

        <SalesCategoryChart />

      </div>

      <div className="surface rounded-2xl p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-main">
              Performance Summary
            </h2>

            <p className="text-sm muted">
              Business performance overview
            </p>
          </div>

          <BarChart3
            className="primary"
            size={22}
          />

        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">

          <SummaryItem
            label="Revenue Growth"
            value="+12.5%"
          />

          <SummaryItem
            label="User Growth"
            value="+8.2%"
          />

          <SummaryItem
            label="Order Growth"
            value="+5.7%"
          />

        </div>
      </div>
    </div>
  );
}

/* ==========================================
   USERS PAGE
========================================== */

function UsersPage() {
  return (
    <div className="space-y-4">

      <div className="grid gap-4 sm:grid-cols-3">

        <SimpleStat
          title="Total Users"
          value="24,892"
          icon={<Users size={21} />}
        />

        <SimpleStat
          title="New Users"
          value="1,284"
          icon={<TrendingUp size={21} />}
        />

        <SimpleStat
          title="Active Today"
          value="8,642"
          icon={<Activity size={21} />}
        />

      </div>

      <ActivityTable />

    </div>
  );
}

/* ==========================================
   PRODUCTS PAGE
========================================== */

function ProductsPage() {
  const products = [
    {
      name: "Premium Plan",
      category: "Subscription",
      sales: "2,840",
      revenue: "$42,600",
      status: "Active",
    },
    {
      name: "Business Plan",
      category: "Subscription",
      sales: "1,920",
      revenue: "$38,400",
      status: "Active",
    },
    {
      name: "Starter Plan",
      category: "Subscription",
      sales: "1,482",
      revenue: "$14,820",
      status: "Active",
    },
    {
      name: "Enterprise",
      category: "Business",
      sales: "320",
      revenue: "$32,000",
      status: "Active",
    },
  ];

  return (
    <div className="surface rounded-2xl p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="font-semibold text-main">
            Product Performance
          </h2>

          <p className="text-sm muted">
            Top products and revenue performance
          </p>
        </div>

        <Package
          className="primary"
          size={22}
        />

      </div>

      <div className="mt-5 overflow-x-auto">

        <table className="w-full min-w-[650px] text-left">

          <thead>
            <tr className="border-b text-xs uppercase muted">
              <th className="px-3 py-3">
                Product
              </th>

              <th className="px-3 py-3">
                Category
              </th>

              <th className="px-3 py-3">
                Sales
              </th>

              <th className="px-3 py-3">
                Revenue
              </th>

              <th className="px-3 py-3">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.name}
                className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className="px-3 py-4 font-medium text-main">
                  {product.name}
                </td>

                <td className="px-3 py-4 text-sm muted">
                  {product.category}
                </td>

                <td className="px-3 py-4 text-sm text-main">
                  {product.sales}
                </td>

                <td className="px-3 py-4 text-sm font-semibold text-main">
                  {product.revenue}
                </td>

                <td className="px-3 py-4">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

/* ==========================================
   REPORTS PAGE
========================================== */

function ReportsPage({
  onExport,
}: {
  onExport: () => void;
}) {
  const reports = [
    {
      name: "Monthly Revenue Report",
      date: "Aug 25, 2026",
      type: "Revenue",
    },
    {
      name: "User Activity Report",
      date: "Aug 24, 2026",
      type: "Users",
    },
    {
      name: "Product Performance",
      date: "Aug 22, 2026",
      type: "Products",
    },
  ];

  return (
    <div className="space-y-4">

      <div className="surface rounded-2xl p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-main">
              Reports
            </h2>

            <p className="text-sm muted">
              Generate and export business reports.
            </p>
          </div>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Download size={17} />
            Export
          </button>

        </div>

        <div className="mt-5 space-y-3">

          {reports.map((report) => (
            <div
              key={report.name}
              className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{
                borderColor:
                  "var(--border)",
              }}
            >
              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/40">
                  <FileText size={20} />
                </div>

                <div>
                  <p className="font-medium text-main">
                    {report.name}
                  </p>

                  <p className="text-sm muted">
                    {report.type} ·{" "}
                    {report.date}
                  </p>
                </div>

              </div>

              <button
                onClick={onExport}
                className="rounded-lg border px-3 py-2 text-sm font-medium text-main hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{
                  borderColor:
                    "var(--border)",
                }}
              >
                Download
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

/* ==========================================
   MESSAGES PAGE
========================================== */

function MessagesPage() {
  const messages = [
    {
      name: "Priya Sharma",
      message:
        "Could you help me with my subscription?",
      time: "5 min ago",
      unread: true,
    },
    {
      name: "Rahul Kumar",
      message:
        "Thank you for the quick response.",
      time: "25 min ago",
      unread: true,
    },
    {
      name: "Ananya Rao",
      message:
        "I have completed the payment.",
      time: "1 hour ago",
      unread: false,
    },
    {
      name: "Vikram Singh",
      message:
        "Can I upgrade my account?",
      time: "2 hours ago",
      unread: false,
    },
  ];

  return (
    <div className="surface rounded-2xl p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="font-semibold text-main">
            Messages
          </h2>

          <p className="text-sm muted">
            Recent customer conversations
          </p>
        </div>

        <MessageSquare
          className="primary"
          size={22}
        />

      </div>

      <div className="mt-5 space-y-2">

        {messages.map((message) => (
          <button
            key={message.name}
            className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >

            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              {message.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex justify-between gap-3">

                <p className="font-medium text-main">
                  {message.name}
                </p>

                <span className="shrink-0 text-xs muted">
                  {message.time}
                </span>

              </div>

              <p className="truncate text-sm muted">
                {message.message}
              </p>

            </div>

            {message.unread && (
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            )}

          </button>
        ))}

      </div>
    </div>
  );
}

/* ==========================================
   SETTINGS PAGE
========================================== */

function SettingsPage({
  dark,
  onToggleTheme,
}: {
  dark: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">

      <div className="surface rounded-2xl p-5 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/40">
            <Settings size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-main">
              Appearance
            </h2>

            <p className="text-sm muted">
              Customize your dashboard experience.
            </p>
          </div>

        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border p-4"
          style={{
            borderColor:
              "var(--border)",
          }}
        >

          <div>
            <p className="font-medium text-main">
              Dark Mode
            </p>

            <p className="text-sm muted">
              {dark
                ? "Dark theme is enabled."
                : "Light theme is enabled."}
            </p>
          </div>

          <button
            onClick={onToggleTheme}
            className={`relative h-7 w-12 rounded-full transition ${
              dark
                ? "bg-indigo-600"
                : "bg-slate-300"
            }`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                dark
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>

        </div>
      </div>

      <div className="surface rounded-2xl p-5 shadow-sm">

        <h2 className="font-semibold text-main">
          Account
        </h2>

        <p className="mt-1 text-sm muted">
          Administrator account information.
        </p>

        <div className="mt-5 space-y-4">

          <div>
            <label className="text-sm font-medium text-main">
              Name
            </label>

            <input
              value="Kusuma C"
              readOnly
              className="mt-2 w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-main"
              style={{
                borderColor:
                  "var(--border)",
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-main">
              Role
            </label>

            <input
              value="Administrator"
              readOnly
              className="mt-2 w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-main"
              style={{
                borderColor:
                  "var(--border)",
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ==========================================
   SMALL COMPONENTS
========================================== */

function QuickInsights() {
  return (
    <div className="surface rounded-2xl p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="font-semibold text-main">
            Quick Insights
          </h2>

          <p className="text-sm muted">
            This month's highlights
          </p>
        </div>

        <MoreHorizontal
          size={20}
          className="muted"
        />

      </div>

      <div className="mt-5 space-y-3">

        <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
          <div className="flex items-center gap-2 font-medium text-main">
            <Activity
              size={18}
              className="primary"
            />
            User activity
          </div>

          <p className="mt-1 text-sm muted">
            Active users increased 8.2%
            compared with last month.
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2 font-medium text-main">
            <ArrowUpRight
              size={18}
              className="text-emerald-600"
            />
            Revenue growth
          </div>

          <p className="mt-1 text-sm muted">
            Revenue is trending above the
            monthly forecast.
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 font-medium text-main">
            <ArrowDownRight
              size={18}
              className="text-amber-600"
            />
            Conversion
          </div>

          <p className="mt-1 text-sm muted">
            Conversion rate needs attention
            this month.
          </p>
        </div>

      </div>
    </div>
  );
}

function AnalyticsStat({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface rounded-2xl p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/40">
          {icon}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            positive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          }`}
        >
          {change}
        </span>

      </div>

      <p className="mt-5 text-sm muted">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-main">
        {value}
      </p>

    </div>
  );
}

function SimpleStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface rounded-2xl p-5 shadow-sm">

      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/40 w-fit">
        {icon}
      </div>

      <p className="mt-4 text-sm muted">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-main">
        {value}
      </p>

    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <p className="text-sm muted">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-main">
        {value}
      </p>
    </div>
  );
}

export default App;