import { ArrowDownRight, ArrowUpRight, DollarSign, ShoppingCart, UserRound, Percent } from "lucide-react";
import type { Metric } from "../types";

const icons = [DollarSign, UserRound, ShoppingCart, Percent];

export default function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const Icon = icons[index];
  return (
    <div className="surface rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
          <Icon size={21} />
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${metric.positive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-red-50 text-red-600 dark:bg-red-950/40"}`}>
          {metric.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {metric.change}
        </span>
      </div>
      <p className="mt-5 text-sm muted">{metric.label}</p>
      <p className="mt-1 text-2xl font-bold text-main">{metric.value}</p>
    </div>
  );
}