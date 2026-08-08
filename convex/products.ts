import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const YUAN_TO_XAF_RATE = 100;
const PROFIT_MARGIN = 0.3;

function derivePricing(priceYuan: number) {
  const costXAF = priceYuan * YUAN_TO_XAF_RATE;
  const sellXAF = costXAF * (1 + PROFIT_MARGIN);
  const profitXAF = sellXAF - costXAF;
  return { costXAF, sellXAF, profitXAF };
}

const productFields = {
  name: v.string(),
  category: v.union(v.literal("shoes"), v.literal("clothes"), v.literal("other")),
  priceYuan: v.number(),
  quantity: v.number(),
  isAvailable: v.boolean(),
  colors: v.array(v.string()),
  sizes: v.array(v.string()),
  images: v.array(v.object({ url: v.string(), publicId: v.string() })),
  notes: v.optional(v.string()),
};

export const list = query({
  args: {
    category: v.optional(v.union(v.literal("shoes"), v.literal("clothes"), v.literal("other"))),
    onlyAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").order("desc").collect();
    if (args.category) {
      products = products.filter((p) => p.category === args.category);
    }
    if (args.onlyAvailable) {
      products = products.filter((p) => p.isAvailable);
    }
    return products;
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalDistinct = products.length;
    const totalSellValueXAF = products.reduce((sum, p) => sum + p.sellXAF * p.quantity, 0);
    const totalCostValueXAF = products.reduce((sum, p) => sum + p.costXAF * p.quantity, 0);
    const totalProfitXAF = products.reduce((sum, p) => sum + p.profitXAF * p.quantity, 0);
    const totalRevenueXAF = products.reduce((sum, p) => sum + p.totalSalesXAF, 0);
    const totalEarnedProfitXAF = products.reduce((sum, p) => sum + p.totalProfitXAF, 0);
    const totalUnitsSold = products.reduce((sum, p) => sum + p.numberSold, 0);
    const availableCount = products.filter((p) => p.isAvailable).length;
    return {
      totalProducts,
      totalDistinct,
      totalSellValueXAF,
      totalCostValueXAF,
      totalProfitXAF,
      totalRevenueXAF,
      totalEarnedProfitXAF,
      totalUnitsSold,
      availableCount,
      unavailableCount: totalDistinct - availableCount,
    };
  },
});

export const create = mutation({
  args: productFields,
  handler: async (ctx, args) => {
    const { costXAF, sellXAF, profitXAF } = derivePricing(args.priceYuan);
    return ctx.db.insert("products", {
      ...args,
      costXAF,
      sellXAF,
      profitXAF,
      numberSold: 0,
      totalSalesXAF: 0,
      totalProfitXAF: 0,
    });
  },
});

export const update = mutation({
  args: { id: v.id("products"), ...productFields },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const { costXAF, sellXAF, profitXAF } = derivePricing(rest.priceYuan);
    await ctx.db.patch(id, { ...rest, costXAF, sellXAF, profitXAF });
  },
});

export const setAvailability = mutation({
  args: { id: v.id("products"), isAvailable: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isAvailable: args.isAvailable });
  },
});

export const recordSale = mutation({
  args: { id: v.id("products"), quantitySold: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    if (args.quantitySold <= 0) throw new Error("Quantity sold must be positive");

    const saleRevenue = product.sellXAF * args.quantitySold;
    const saleProfit = product.profitXAF * args.quantitySold;

    await ctx.db.patch(args.id, {
      numberSold: args.quantitySold,
      totalSalesXAF: saleRevenue,
      totalProfitXAF: saleProfit,
      // Set stock to remaining after this sale
      quantity: Math.max(0, product.quantity - args.quantitySold),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
