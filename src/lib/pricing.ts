// Central pricing rules for the catalog.
//
// Sourcing currency is Yuan (CNY). The base conversion to XAF is a flat
// x100 multiplier, then a 30% margin is added on top to get the sell price.
//
//   costXAF   = priceYuan * 100
//   sellXAF   = costXAF * 1.30
//   profitXAF = sellXAF - costXAF   (== costXAF * 0.30)

export const YUAN_TO_XAF_RATE = 100;
export const PROFIT_MARGIN = 0.3;

export function costXAF(priceYuan: number): number {
  return priceYuan * YUAN_TO_XAF_RATE;
}

export function sellXAF(priceYuan: number): number {
  return costXAF(priceYuan) * (1 + PROFIT_MARGIN);
}

export function profitXAF(priceYuan: number): number {
  return sellXAF(priceYuan) - costXAF(priceYuan);
}

export function formatXAF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + " FCFA";
}

export function formatYuan(amount: number): string {
  return "¥" + new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(amount);
}
