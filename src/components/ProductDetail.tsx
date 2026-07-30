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
              onClick={() => {
                const msg = encodeURIComponent(
                  [
                    `📝 *Name*: ${product.name}`,
                    `📝 *Category*: ${product.category ==="other"?"other / autres" : product.category }`,
                    ``,
                    `💰 *Pricing*: (${formatXAF(product.sellXAF)})`,
                    ``,
                    product.colors.length ? `🎨 *Colors*: ${product.colors.join(", ")}` : "",
                    product.sizes.length ? `📏 *Sizes*: ${product.sizes.join(", ")}` : "",
                    product.notes ? `\n📝 *Notes*: ${product.notes}` : "",
                  ]
                    .filter(Boolean)
                    .join("\n")
                );
                window.open(`https://wa.me/?text=${msg}`, "_blank");
              }}
              className="flex-1 min-w-[120px] rounded-sm bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share
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