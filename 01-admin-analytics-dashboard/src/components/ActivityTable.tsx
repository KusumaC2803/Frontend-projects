import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { activities } from "../data";

type Status = "All" | "Active" | "Pending" | "Blocked";
type UserType = "All" | "New" | "Member";

type SortKey = "name" | "date" | "status";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 5;

export default function ActivityTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("All");
  const [type, setType] = useState<UserType>("All");

  const [sortKey, setSortKey] =
    useState<SortKey>("date");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [page, setPage] = useState(1);

  const filteredActivities = useMemo(() => {
    const result = activities.filter((user) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue);

      const matchesStatus =
        status === "All" || user.status === status;

      const matchesType =
        type === "All" || user.type === type;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });

    result.sort((a, b) => {
      let comparison = 0;

      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name);
      }

      if (sortKey === "date") {
        comparison =
          new Date(a.date).getTime() -
          new Date(b.date).getTime();
      }

      if (sortKey === "status") {
        comparison = a.status.localeCompare(
          b.status
        );
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    search,
    status,
    type,
    sortKey,
    sortDirection,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredActivities.length / PAGE_SIZE
    )
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedActivities =
    filteredActivities.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );

  const changeSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((value) =>
        value === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }

    setPage(1);
  };

  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (
    value: Status
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handleType = (
    value: UserType
  ) => {
    setType(value);
    setPage(1);
  };

  const statusClass = (value: string) => {
    if (value === "Active") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
    }

    if (value === "Pending") {
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
    }

    return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  };

  return (
    <div className="surface rounded-2xl p-5 shadow-sm xl:col-span-2">

      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h2 className="font-semibold text-main">
            Recent Users
          </h2>

          <p className="text-sm muted">
            Manage your latest users and accounts.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 self-start rounded-xl border px-3 py-2 text-sm font-medium text-main transition hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <MoreHorizontal size={17} />
          Actions
        </button>

      </div>

      {/* Filters */}

      <div className="mt-5 flex flex-col gap-3 md:flex-row">

        {/* Search */}

        <div className="relative flex-1">

          <Search
            size={17}
            className="muted absolute left-3 top-1/2 -translate-y-1/2"
          />

          <input
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
            placeholder="Search users..."
            className="w-full rounded-xl border bg-transparent py-2.5 pl-10 pr-4 text-sm text-main outline-none transition focus:ring-2 focus:ring-indigo-500"
            style={{
              borderColor: "var(--border)",
            }}
          />

        </div>

        {/* Status Filter */}

        <div className="relative">
          <select
            value={status}
            onChange={(event) =>
              handleStatus(
                event.target.value as Status
              )
            }
            className="w-full appearance-none rounded-xl border bg-transparent px-4 py-2.5 pr-9 text-sm text-main outline-none md:w-36"
            style={{
              borderColor: "var(--border)",
            }}
          >
            <option value="All">
              All Status
            </option>
            <option value="Active">
              Active
            </option>
            <option value="Pending">
              Pending
            </option>
            <option value="Blocked">
              Blocked
            </option>
          </select>

          <ChevronDown
            size={15}
            className="muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>

        {/* Type Filter */}

        <div className="relative">
          <select
            value={type}
            onChange={(event) =>
              handleType(
                event.target.value as UserType
              )
            }
            className="w-full appearance-none rounded-xl border bg-transparent px-4 py-2.5 pr-9 text-sm text-main outline-none md:w-32"
            style={{
              borderColor: "var(--border)",
            }}
          >
            <option value="All">
              All Types
            </option>
            <option value="New">
              New
            </option>
            <option value="Member">
              Member
            </option>
          </select>

          <ChevronDown
            size={15}
            className="muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>

      </div>

      {/* Table */}

      <div className="mt-5 overflow-x-auto">

        <table className="w-full min-w-[700px] text-left">

          <thead>
            <tr className="border-b text-xs uppercase tracking-wide muted">
              <th className="px-3 py-3 font-medium">
                <button
                  onClick={() =>
                    changeSort("name")
                  }
                  className="inline-flex items-center gap-1"
                >
                  User
                  {sortKey === "name" &&
                    (sortDirection === "asc"
                      ? "↑"
                      : "↓")}
                </button>
              </th>

              <th className="px-3 py-3 font-medium">
                <button
                  onClick={() =>
                    changeSort("date")
                  }
                  className="inline-flex items-center gap-1"
                >
                  Joined
                  {sortKey === "date" &&
                    (sortDirection === "asc"
                      ? "↑"
                      : "↓")}
                </button>
              </th>

              <th className="px-3 py-3 font-medium">
                <button
                  onClick={() =>
                    changeSort("status")
                  }
                  className="inline-flex items-center gap-1"
                >
                  Status
                  {sortKey === "status" &&
                    (sortDirection === "asc"
                      ? "↑"
                      : "↓")}
                </button>
              </th>

              <th className="px-3 py-3 font-medium">
                Type
              </th>

              <th className="px-3 py-3 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {paginatedActivities.map(
              (user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >

                  {/* User */}

                  <td className="px-3 py-4">

                    <div className="flex items-center gap-3">

                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        {user.name
                          .split(" ")
                          .map(
                            (name) =>
                              name[0]
                          )
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div>
                        <p className="font-medium text-main">
                          {user.name}
                        </p>

                        <p className="text-xs muted">
                          {user.email}
                        </p>
                      </div>

                    </div>

                  </td>

                  {/* Date */}

                  <td className="px-3 py-4 text-sm muted">
                    {new Date(
                      user.date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>

                  {/* Status */}

                  <td className="px-3 py-4">

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>

                  </td>

                  {/* Type */}

                  <td className="px-3 py-4 text-sm text-main">
                    {user.type}
                  </td>

                  {/* Action */}

                  <td className="px-3 py-4 text-right">

                    <button
                      aria-label={`Actions for ${user.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <MoreHorizontal
                        size={18}
                      />
                    </button>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

        {/* Empty State */}

        {paginatedActivities.length === 0 && (
          <div className="py-12 text-center">

            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Search
                size={20}
                className="muted"
              />
            </div>

            <h3 className="font-semibold text-main">
              No users found
            </h3>

            <p className="mt-1 text-sm muted">
              Try changing your search or filters.
            </p>

          </div>
        )}

      </div>

      {/* Pagination */}

      <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: "var(--border)",
        }}
      >

        <p className="text-sm muted">
          Showing{" "}
          {filteredActivities.length === 0
            ? 0
            : (currentPage - 1) *
                PAGE_SIZE +
              1}{" "}
          to{" "}
          {Math.min(
            currentPage * PAGE_SIZE,
            filteredActivities.length
          )}{" "}
          of{" "}
          {filteredActivities.length}{" "}
          users
        </p>

        <div className="flex items-center gap-2">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setPage((value) =>
                Math.max(1, value - 1)
              )
            }
            className="rounded-lg border p-2 text-main transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
            style={{
              borderColor: "var(--border)",
            }}
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <span className="min-w-16 text-center text-sm font-medium text-main">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setPage((value) =>
                Math.min(
                  totalPages,
                  value + 1
                )
              )
            }
            className="rounded-lg border p-2 text-main transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
            style={{
              borderColor: "var(--border)",
            }}
            aria-label="Next page"
          >
            <ChevronRight size={17} />
          </button>

        </div>

      </div>

    </div>
  );
}