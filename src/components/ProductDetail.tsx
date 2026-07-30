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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-ledger-line p-6 w-full max-w-sm shadow-lg">
        <h3 className="font-display text-lg font-semibold text-ledger-ink mb-2">
          Record sale
        </h3>
        <p className="text-sm text-ledger-inkSoft mb-4">{productName}</p>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
          Quantity sold
        </label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="tnum w-full rounded-sm border border-ledger-line px-3 py-2 text-sm focus:border-ledger-ink mb-4"
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-4 py-2 text-sm font-medium text-ledger-inkSoft hover:text-ledger-ink"
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

export default function ProductDetail({
  productId,
  onEdit,
  onBack,
}: {
  productId: Id<"products">;
  onEdit: (id: Id<"products">) => void;
  onBack: () => void;
}) {
  const product = useQuery(api.products.get, { id: productId });
  const [selectedImage, setSelectedImage] = useState(0);
  const [recordSale, setRecordSale] = useState(false);

  if (product === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ledger-gold border-t-transparent" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="text-center py-20">
        <p className="text-ledger-inkSoft">Product not found.</p>
        <button onClick={onBack} className="mt-4 text-sm font-medium text-ledger-ink hover:text-ledger-gold">
          ← Back to ledger
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-ledger-inkSoft hover:text-ledger-ink mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to ledger
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Left column: Images */}
        <div className="lg:col-span-3">
          {product.images.length > 0 ? (
            <>
              <div className="aspect-square rounded-sm border border-ledger-line bg-ledger-panel overflow-hidden mb-3">
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={img.publicId}
                      onClick={() => setSelectedImage(i)}
                      className={`shrink-0 h-16 w-16 rounded-sm border-2 overflow-hidden transition-colors ${
                        i === selectedImage
                          ? "border-ledger-gold"
                          : "border-ledger-line hover:border-ledger-inkSoft"
                      }`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square rounded-sm border border-ledger-line bg-ledger-panel flex items-center justify-center">
              <svg className="w-16 h-16 text-ledger-inkSoft/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ledger-gold mb-1">
              {product.category}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ledger-ink leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing card */}
          <div className="rounded-sm border border-ledger-line bg-ledger-panel divide-y divide-ledger-line">
            <div className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ledger-inkSoft mb-2">
                Pricing
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-ledger-inkSoft">Cost</p>
                  <p className="tnum font-medium text-ledger-ink">{formatYuan(product.priceYuan)}</p>
                  <p className="tnum text-[11px] text-ledger-inkSoft">{formatXAF(product.costXAF)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ledger-inkSoft">Sell</p>
                  <p className="tnum font-medium text-ledger-gold">{formatXAF(product.sellXAF)}</p>
                  <p className="tnum text-[11px] text-ledger-inkSoft">+20% margin</p>
                </div>
                <div>
                  <p className="text-[10px] text-ledger-inkSoft">Profit</p>
                  <p className="tnum font-medium text-ledger-good">{formatXAF(product.profitXAF)}</p>
                  <p className="tnum text-[11px] text-ledger-inkSoft">per unit</p>
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ledger-inkSoft">
                  Stock
                </p>
                <p className="tnum font-display text-xl font-semibold text-ledger-ink mt-1">
                  {product.quantity}
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-sm text-xs font-medium ${
                  product.isAvailable
                    ? "bg-ledger-good/10 text-ledger-good"
                    : "bg-ledger-bad/10 text-ledger-bad"
                }`}
              >
                {product.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          {/* Sales tracking card */}
          <div className="rounded-sm border border-ledger-line bg-ledger-panel p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ledger-inkSoft mb-3">
              Sales history
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-ledger-inkSoft">Sold</p>
                <p className="tnum font-display text-lg font-semibold text-ledger-ink">{product.numberSold}</p>
              </div>
              <div>
                <p className="text-[10px] text-ledger-inkSoft">Revenue</p>
                <p className="tnum font-display text-lg font-semibold text-ledger-gold">{formatXAF(product.totalSalesXAF)}</p>
              </div>
              <div>
                <p className="text-[10px] text-ledger-inkSoft">Profit</p>
                <p className="tnum font-display text-lg font-semibold text-ledger-good">{formatXAF(product.totalProfitXAF)}</p>
              </div>
            </div>
          </div>

          {/* Colors & Sizes */}
          <div className="grid grid-cols-2 gap-4">
            {product.colors.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ledger-inkSoft mb-2">
                  Colors
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map((c) => (
                    <span key={c} className="rounded-sm bg-ledger-bg border border-ledger-line px-2 py-1 text-xs font-medium text-ledger-ink">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.sizes.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ledger-inkSoft mb-2">
                  Sizes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <span key={s} className="rounded-sm bg-ledger-bg border border-ledger-line px-2 py-1 text-xs font-medium text-ledger-ink">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {product.notes && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
                Notes
              </p>
              <p className="text-sm text-ledger-ink bg-ledger-bg border border-ledger-line rounded-sm p-3">
                {product.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setRecordSale(true)}
              className="flex-1 min-w-[120px] rounded-sm bg-ledger-good px-4 py-2.5 text-sm font-medium text-white hover:opacity-80 transition-opacity"
            >
              + Record Sale
            </button>
            <button
              onClick={() => onEdit(productId)}
              className="flex-1 min-w-[120px] rounded-sm bg-ledger-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ledger-inkSoft transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {recordSale && (
        <RecordSaleDialog
          productId={productId}
          productName={product.name}
          onClose={() => setRecordSale(false)}
        />
      )}
    </div>
  );
}