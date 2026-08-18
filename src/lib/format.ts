import { site } from "./site";

const priceFormatter = new Intl.NumberFormat(site.locale, {
  style: "currency",
  currency: site.currency,
  maximumFractionDigits: 0,
});

const preciseFormatter = new Intl.NumberFormat(site.locale, {
  style: "currency",
  currency: site.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,299 — whole rupees unless the amount has paise. */
export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return priceFormatter.format(0);
  return Number.isInteger(value) ? priceFormatter.format(value) : preciseFormatter.format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(site.locale).format(value);
}

export function formatDate(value: string | number | Date): string {
  return new Intl.DateTimeFormat(site.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/** "Wed, 20 Aug" style delivery estimates. */
export function formatDeliveryDate(daysFromNow: number, from = Date.now()): string {
  const date = new Date(from + daysFromNow * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat(site.locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function truncate(value: string, max = 120): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}
