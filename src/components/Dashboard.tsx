import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatXAF } from "../lib/pricing";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gold" | "good" | "bad";
}) {
  const accentColor =
    accent === "gold"
      ? "text-ledger-gold"
      : accent === "good"
      ? "text-ledger-good"
      : accent === "bad"
      ? "text-ledger-bad"
      : "text-ledger-ink";

  return (
    <div className="rounded-sm border border-ledger-line bg-ledger-panel p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft">
        {label}
      </p>
      <p className={`tnum font-display text-2xl font-semibold mt-1 ${accentColor}`}>
        {value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const stats = useQuery(api.products.stats, {});

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-sm border border-ledger-line bg-ledger-panel animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <StatCard label="Total products (units)" value={stats.totalProducts.toLocaleString("fr-FR")} />
      <StatCard label="Listings available" value={`${stats.availableCount} / ${stats.totalDistinct}`} />
      <StatCard label="Units sold" value={stats.totalUnitsSold.toLocaleString("fr-FR")} />
      <StatCard label="Inventory value" value={formatXAF(stats.totalSellValueXAF)} accent="gold" />
      <StatCard label="Revenue from sales" value={formatXAF(stats.totalRevenueXAF)} accent="gold" />
      <StatCard label="Earned profit" value={formatXAF(stats.totalEarnedProfitXAF)} accent="good" />
    </div>
  );
}
