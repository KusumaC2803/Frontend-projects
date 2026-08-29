import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Electronics", value: 34 },
  { name: "Fashion", value: 24 },
  { name: "Home", value: 22 },
  { name: "Beauty", value: 12 },
  { name: "Other", value: 8 },
];

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#94a3b8",
];

export default function SalesCategoryChart() {
  return (
    <div className="surface rounded-2xl p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="font-semibold text-main">
          Sales by Category
        </h2>

        <p className="text-sm muted">
          Share of total sales
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [`${value}%`, "Share"]}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}