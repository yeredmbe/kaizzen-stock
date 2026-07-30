# Product Ledger — Dashboard

A product/inventory dashboard: Convex backend, React + Tailwind frontend,
Cloudinary for images.

## Pricing rule

Sourcing price is entered in **Yuan**. Two numbers are derived automatically
(server-side, in `convex/products.ts`, and mirrored for live preview in
`src/lib/pricing.ts`):

```
costXAF   = priceYuan × 100
sellXAF   = costXAF × 1.20      (20% profit margin)
profitXAF = sellXAF − costXAF
```

Change `YUAN_TO_XAF_RATE` or `PROFIT_MARGIN` in both files if the conversion
rate or margin changes — they're kept as named constants for that reason.

## Setup

```bash
npm install
npx convex dev        # creates your Convex deployment, prints VITE_CONVEX_URL
cp .env.example .env.local
# paste the Convex URL, then add your Cloudinary cloud name + unsigned preset
npm run dev
```

### Cloudinary unsigned preset

Uploads happen straight from the browser (no server secret involved):

1. Cloudinary console → Settings → Upload → Add upload preset
2. Signing mode: **Unsigned**
3. Copy the preset name and your cloud name into `.env.local`

## What's here

- `convex/schema.ts` — `products` table: name, category, priceYuan,
  derived costXAF/sellXAF/profitXAF, quantity, isAvailable, colors, sizes, images
- `convex/products.ts` — list/get/stats queries, create/update/setAvailability/remove mutations
- `src/components/Dashboard.tsx` — total units, listings available, inventory value, projected profit
- `src/components/ProductTable.tsx` — filterable table, inline availability toggle
- `src/components/ProductForm.tsx` — create/edit form: Yuan price with live cost/sell/profit
  preview, tag inputs for colors, size picker (shoe sizes 36–45 or clothing XS–XXL
  depending on category), multi-image Cloudinary upload

## Notes

- "Total products" on the dashboard sums `quantity` across all listings (units in
  stock), while "Listings available" counts distinct products marked available.
- Sizes switch automatically based on category: numeric shoe sizes for `shoes`,
  letter sizes for `clothes`, free-text tags for `other`.
