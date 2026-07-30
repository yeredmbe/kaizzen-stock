import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { uploadToCloudinary, UploadedImage } from "../lib/cloudinary";
import { costXAF, sellXAF, profitXAF, formatXAF } from "../lib/pricing";

type Category = "shoes" | "clothes" | "other";

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }

  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-sm bg-ledger-goldSoft px-2 py-1 text-xs font-medium text-ledger-ink"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-ledger-inkSoft hover:text-ledger-bad"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
        className="w-full rounded-sm border border-ledger-line px-3 py-2 text-sm focus:border-ledger-ink"
      />
    </div>
  );
}

export default function ProductForm({
  productId,
  onDone,
}: {
  productId?: Id<"products">;
  onDone: () => void;
}) {
  const existing = useQuery(api.products.get, productId ? { id: productId } : "skip");
  const create = useMutation(api.products.create);
  const update = useMutation(api.products.update);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("shoes");
  const [priceYuan, setPriceYuan] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAvailable, setIsAvailable] = useState(true);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setCategory(existing.category);
      setPriceYuan(existing.priceYuan);
      setQuantity(existing.quantity);
      setIsAvailable(existing.isAvailable);
      setColors(existing.colors);
      setSizes(existing.sizes);
      setImages(existing.images);
    }
  }, [existing]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadToCloudinary));
      setImages((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product needs a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { name: name.trim(), category, priceYuan, quantity, isAvailable, colors, sizes, images };
      if (productId) {
        await update({ id: productId, ...payload });
      } else {
        await create(payload);
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const sizeOptions =
    category === "shoes"
      ? ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
      : category === "clothes"
      ? ["XS", "S", "M", "L", "XL", "XXL"]
      : [];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h2 className="font-display text-xl font-semibold text-ledger-ink mb-6">
        {productId ? "Edit product" : "New product"}
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Air runner sneaker"
            className="w-full rounded-sm border border-ledger-line px-3 py-2 text-sm focus:border-ledger-ink"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-sm border border-ledger-line px-3 py-2 text-sm bg-white focus:border-ledger-ink"
            >
              <option value="shoes">Shoes</option>
              <option value="clothes">Clothes</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
              Quantity in stock
            </label>
            <input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="tnum w-full rounded-sm border border-ledger-line px-3 py-2 text-sm focus:border-ledger-ink"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
            Supplier price (Yuan)
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={priceYuan}
            onChange={(e) => setPriceYuan(Number(e.target.value))}
            className="tnum w-full rounded-sm border border-ledger-line px-3 py-2 text-sm focus:border-ledger-ink"
          />
          <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3 rounded-sm bg-ledger-bg border border-ledger-line p-2 sm:p-3 text-[10px] sm:text-xs">
            <div>
              <p className="text-ledger-inkSoft">Cost</p>
              <p className="tnum font-medium text-ledger-ink">{formatXAF(costXAF(priceYuan))}</p>
            </div>
            <div>
              <p className="text-ledger-inkSoft">Sell (+20%)</p>
              <p className="tnum font-medium text-ledger-gold">{formatXAF(sellXAF(priceYuan))}</p>
            </div>
            <div>
              <p className="text-ledger-inkSoft">Profit</p>
              <p className="tnum font-medium text-ledger-good">{formatXAF(profitXAF(priceYuan))}</p>
            </div>
          </div>
        </div>

        <TagInput label="Colors available" values={colors} onChange={setColors} placeholder="Type a color, press Enter" />

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
            Sizes available
          </label>
          {sizeOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((s) => {
                const active = sizes.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSizes(active ? sizes.filter((x) => x !== s) : [...sizes, s])}
                    className={`px-3 py-1 rounded-sm text-xs font-medium border ${
                      active
                        ? "bg-ledger-ink text-white border-ledger-ink"
                        : "bg-white text-ledger-inkSoft border-ledger-line hover:border-ledger-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          ) : (
            <TagInput label="" values={sizes} onChange={setSizes} placeholder="Type a size, press Enter" />
          )}
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-ledger-inkSoft mb-1.5">
            Images
          </label>
          <div className="flex flex-wrap gap-3 mb-2">
            {images.map((img) => (
              <div key={img.publicId} className="relative">
                <img src={img.url} className="h-16 w-16 rounded-sm object-cover border border-ledger-line" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((i) => i.publicId !== img.publicId))}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-ledger-bad text-white text-xs leading-5"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
            className="text-sm"
          />
          {uploading && <p className="text-xs text-ledger-inkSoft mt-1">Uploading…</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-ledger-ink">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="accent-ledger-gold"
          />
          Available for sale
        </label>

        {error && <p className="text-sm text-ledger-bad">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-sm bg-ledger-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ledger-inkSoft disabled:opacity-50"
          >
            {saving ? "Saving…" : productId ? "Save changes" : "Add product"}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-sm px-5 py-2.5 text-sm font-medium text-ledger-inkSoft hover:text-ledger-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
