import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    category: v.union(v.literal("shoes"), v.literal("clothes"), v.literal("other")),

    // Sourcing price, entered by hand from the supplier in Yuan.
    priceYuan: v.number(),
    // Derived and stored so the table/dashboard can query/sort without
    // recomputing on every read. Recalculated server-side on every write.
    costXAF: v.number(),
    sellXAF: v.number(),
    profitXAF: v.number(),

    quantity: v.number(), // units in stock, feeds "total products"
    isAvailable: v.boolean(),

    colors: v.array(v.string()),
    sizes: v.array(v.string()), // shoe sizes (e.g. "40") or clothing sizes (e.g. "M")

    images: v.array(
      v.object({
        url: v.string(),
        publicId: v.string(),
      })
    ),

    notes: v.optional(v.string()),

    // Sales tracking – accumulated over time as sales are recorded
    numberSold: v.number(),
    totalSalesXAF: v.number(),
    totalProfitXAF: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_availability", ["isAvailable"]),
});
