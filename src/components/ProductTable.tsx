import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatXAF, formatYuan } from "../lib/pricing";

function RecordSaleDialog({
  productId,
  productName,
  onClose,
}: {
  productId: Id<"products">;
  productName: string;
  onClose: () => void;
}) {
  const [qty, setQty] = useState(1);
  const recordSale = useMutation(api.products.recordSale);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await recordSale({ id: productId, quantitySold: qty });
      onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-ledger-line p-6 w-80 shadow-lg dark:bg-ledger-dark-panel dark:border-ledger-dark-line">
        <h3 className="font-display text-lg font-semibold text-ledger-ink mb-2 dark:text-ledger-dark-ink">
          Record sale
        </h3>
        <p className="text-sm text-ledger-inkSoft mb-4 dark:text-ledger-dark-inkSoft">{productName}</p>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5 dark:text-ledger-dark-inkSoft">
          Quantity sold
        </label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="tnum w-full rounded-sm border border-ledger-line px-3 py-2 text-sm focus:border-ledger-ink mb-4 dark:border-ledger-dark-line dark:bg-ledger-dark-bg dark:text-ledger-dark-ink dark:focus:border-ledger-dark-ink"
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-4 py-2 text-sm font-medium text-ledger-inkSoft hover:text-ledger-ink dark:text-ledger-dark-inkSoft dark:hover:text-ledger-dark-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-ledger-good px-4 py-2 text-sm font-medium text-white hover:opacity-80 disabled:opacity-50"
          >
            {saving ? "Recording…" : "Record"}
          </button>
        </div>
      </form>
    </div>
  );
}

type Category = "shoes" | "clothes" | "other";

export default function ProductTable({
  onView,
  onEdit,
}: {
  onView: (id: Id<"products">) => void;
  onEdit: (id: Id<"products">) => void;
}) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [recordSaleFor, setRecordSaleFor] = useState<{ id: Id<"products">; name: string } | null>(null);

  const products = useQuery(api.products.list, {
    category: category === "all" ? undefined : category,
    onlyAvailable: onlyAvailable || undefined,
  });

  const setAvailability = useMutation(api.products.setAvailability);
  const remove = useMutation(api.products.remove);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(["all", "shoes", "clothes", "other"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-sm text-sm font-medium border transition-colors ${
              category === c
                ? "bg-ledger-ink text-white border-ledger-ink dark:bg-ledger-dark-ink dark:border-ledger-dark-ink"
                : "bg-ledger-panel text-ledger-inkSoft border-ledger-line hover:border-ledger-ink dark:bg-ledger-dark-panel dark:text-ledger-dark-inkSoft dark:border-ledger-dark-line dark:hover:border-ledger-dark-ink"
            }`}
          >
            {c === "all" ? "All" : c[0].toUpperCase() + c.slice(1)}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-2 text-sm text-ledger-inkSoft dark:text-ledger-dark-inkSoft">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="accent-ledger-gold"
          />
          Available only
        </label>
      </div>

      <div className="rounded-sm border border-ledger-line bg-ledger-panel overflow-x-auto dark:border-ledger-dark-line dark:bg-ledger-dark-panel">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ledger-line bg-ledger-bg/60 text-left font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft dark:border-ledger-dark-line dark:bg-ledger-dark-bg/60 dark:text-ledger-dark-inkSoft">
              <th className="px-4 py-3 whitespace-nowrap">ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Product</th>
              <th className="px-4 py-3 whitespace-nowrap">Colors</th>
              <th className="px-4 py-3 whitespace-nowrap">Sizes</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Cost (¥)</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Sell (FCFA)</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Profit (FCFA)</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Sold</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Sales (FCFA)</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Profit (FCFA)</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Qty</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody>
            {products === undefined && (
              <tr>
                <td colSpan={12} className="px-4 py-6 text-center text-ledger-inkSoft dark:text-ledger-dark-inkSoft">
                  Loading…
                </td>
              </tr>
            )}
            {products?.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-ledger-inkSoft dark:text-ledger-dark-inkSoft">
                  No products match these filters yet. Add one to start the ledger.
                </td>
              </tr>
            )}
            {products?.map((p, i) => (
              <tr
                key={p._id}
                onClick={() => onView(p._id)}
                className="border-b border-ledger-line last:border-0 hover:bg-ledger-bg/40 cursor-pointer dark:border-ledger-dark-line dark:hover:bg-ledger-dark-bg/40"
              >
                <td className="px-4 py-3 text-ledger-inkSoft whitespace-nowrap dark:text-ledger-dark-inkSoft">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="h-10 w-10 rounded-sm object-cover border border-ledger-line shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-sm shrink-0 bg-ledger-bg border border-ledger-line" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-ledger-ink truncate max-w-[120px] sm:max-w-none dark:text-ledger-dark-ink">{p.name}</p>
                      <p className="text-xs text-ledger-inkSoft capitalize dark:text-ledger-dark-inkSoft">{p.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ledger-inkSoft whitespace-nowrap dark:text-ledger-dark-inkSoft">{p.colors.join(", ") || "—"}</td>
                <td className="px-4 py-3 text-ledger-inkSoft whitespace-nowrap dark:text-ledger-dark-inkSoft">{p.sizes.join(", ") || "—"}</td>
                <td className="tnum px-4 py-3 text-right whitespace-nowrap">{formatYuan(p.priceYuan)}</td>
                <td className="tnum px-4 py-3 text-right font-medium whitespace-nowrap">{formatXAF(p.sellXAF)}</td>
                <td className="tnum px-4 py-3 text-right text-ledger-good whitespace-nowrap dark:text-ledger-dark-good">{formatXAF(p.profitXAF)}</td>
                <td className="tnum px-4 py-3 text-right whitespace-nowrap">{p.numberSold}</td>
                <td className="tnum px-4 py-3 text-right text-ledger-gold whitespace-nowrap dark:text-ledger-dark-gold">{formatXAF(p.totalSalesXAF)}</td>
                <td className="tnum px-4 py-3 text-right text-ledger-good whitespace-nowrap dark:text-ledger-dark-good">{formatXAF(p.totalProfitXAF)}</td>
                <td className="tnum px-4 py-3 text-right whitespace-nowrap">{p.quantity}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvailability({ id: p._id, isAvailable: !p.isAvailable });
                    }}
                    className={`px-2 py-1 rounded-sm text-xs font-medium ${
                      p.isAvailable
                        ? "bg-ledger-good/10 text-ledger-good dark:bg-ledger-dark-good/10 dark:text-ledger-dark-good"
                        : "bg-ledger-bad/10 text-ledger-bad dark:bg-ledger-dark-bad/10 dark:text-ledger-dark-bad"
                    }`}
                  >
                    {p.isAvailable ? "Available" : "Unavailable"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecordSaleFor({ id: p._id, name: p.name });
                    }}
                    className="text-xs font-medium text-ledger-good hover:opacity-70 mr-2 dark:text-ledger-dark-good"
                  >
                    + Sale
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(p._id);
                    }}
                    className="text-xs font-medium text-ledger-gold hover:opacity-70 mr-2 dark:text-ledger-dark-gold"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(p._id);
                    }}
                    className="text-xs font-medium text-ledger-inkSoft hover:text-ledger-ink mr-2 dark:text-ledger-dark-inkSoft dark:hover:text-ledger-dark-ink"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove "${p.name}" from the ledger?`)) remove({ id: p._id });
                    }}
                    className="text-xs font-medium text-ledger-bad hover:opacity-70 dark:text-ledger-dark-bad"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recordSaleFor && (
        <RecordSaleDialog
          productId={recordSaleFor.id}
          productName={recordSaleFor.name}
          onClose={() => setRecordSaleFor(null)}
        />
      )}
    </div>
  );
}