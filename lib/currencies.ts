export type Currency = {
  code: string;
  label: string;
  symbol: string;
};

export const CURRENCIES: Currency[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", label: "Swedish Krona", symbol: "kr" },
];

export const DEFAULT_CURRENCY = "USD";

export function getCurrency(code: string | null | undefined): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function formatMoney(
  amount: number,
  currencyCode: string,
  options?: { compact?: boolean },
): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      notation: options?.compact ? "compact" : "standard",
      maximumFractionDigits: currencyCode === "JPY" ? 0 : 0,
    }).format(amount);
  } catch {
    return `${getCurrency(currencyCode).symbol}${amount.toLocaleString()}`;
  }
}

export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  currencyCode: string = DEFAULT_CURRENCY,
): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) {
    return `${formatMoney(min, currencyCode)} – ${formatMoney(max, currencyCode)}`;
  }
  const value = min ?? max;
  if (value == null) return null;
  return formatMoney(value, currencyCode);
}
