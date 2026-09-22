import type { Currency } from "./types";

export function formatAmount(amount: number, currency: Currency): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";
  const abs = Math.abs(amount);

  if (currency === "UZS") {
    return `${sign}${groupThousands(Math.round(abs), "\u00a0")}`;
  }

  const hasFraction = Math.abs(abs - Math.round(abs)) > 1e-9;
  const body = hasFraction
    ? abs.toFixed(2)
    : groupThousands(Math.round(abs), ",");
  return `${sign}${body}`;
}

export function formatAbs(amount: number, currency: Currency): string {
  return formatAmount(Math.abs(amount), currency).replace(/^[+−]/, "");
}

export function formatWithCode(amount: number, currency: Currency): string {
  return `${formatAmount(amount, currency)} ${currency}`;
}

function groupThousands(value: number, separator: string): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function currencySymbol(currency: Currency): string {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "so'm";
}
