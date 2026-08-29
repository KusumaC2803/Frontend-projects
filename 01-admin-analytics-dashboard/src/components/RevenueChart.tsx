import { BarChart3 } from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartItem = {
  month: string;
  revenue: number;
  users: number;
};

type RevenueChartProps = {
  data: ChartItem[];
};

export default function RevenueChart({
  data,
}: RevenueChartProps) {
  return (
    <div className="surface rounded-2xl p-5 shadow-sm lg:col-span-2">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-main">
            Revenue & Users
          </h2>

          <p className="text-sm muted">
            Performance for the selected period
          </p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
          <BarChart3 size={19} />
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={data}
            barGap={8}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#4f46e5"
              radius={[6, 6, 0, 0]}
            />

            <Bar
              dataKey="users"
              name="Users"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}