import type { Currency, ParsedTransaction } from "./types";

const KEYWORD_RE = /\b(?:kirim|chiqim|jami)\b/gi;
const CURRENCY_TOKEN_RE =
  /\$|€|\b(?:usd|eur|soum|som)\b|(?<=\d)s\b|\bs\b/gi;

/** Standalone numbers, including space/dot thousand groups. Not 3kg. */
const STANDALONE_NUMBER_RE =
  /(?<![A-Za-z])\d+(?:[.\s]\d{3})*(?:[.,]\d{1,2})?(?![A-Za-z])/g;

export function hasFinancialIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (t.startsWith("+")) return true;
  if (/\b(?:kirim|chiqim|jami)\b/i.test(t)) return true;
  if (/[€$]/.test(t)) return true;
  if (/\b(?:usd|eur|soum|som)\b/i.test(t)) return true;
  return false;
}

export function parseTransactionInput(text: string): ParsedTransaction | null {
  const raw = text.trim();
  if (!raw) return null;

  const isIncome = raw.startsWith("+") || /\bkirim\b/i.test(raw);
  const currency = detectCurrency(raw);

  const matches = [...raw.matchAll(STANDALONE_NUMBER_RE)];
  if (matches.length === 0) return null;

  const last = matches[matches.length - 1];
  const token = last[0];
  const price = parsePriceToken(token);
  if (!Number.isFinite(price) || price === 0) return null;

  const amount = isIncome ? price : -price;
  const note = extractNote(raw, last.index ?? 0, token.length, isIncome);

  return {
    amount,
    currency,
    note,
    type: isIncome ? "income" : "expense",
  };
}

function detectCurrency(text: string): Currency {
  const lower = text.toLowerCase();
  if (lower.includes("$") || lower.includes("usd")) return "USD";
  if (lower.includes("€") || lower.includes("eur")) return "EUR";
  return "UZS";
}

function parsePriceToken(token: string): number {
  const compact = token.replace(/\s/g, "");

  if (/^\d{1,3}(?:\.\d{3})+$/.test(compact)) {
    return Number(compact.replace(/\./g, ""));
  }
  if (/^\d{1,3}(?:,\d{3})+$/.test(compact)) {
    return Number(compact.replace(/,/g, ""));
  }
  if (/^\d+,\d{1,2}$/.test(compact)) {
    return Number(compact.replace(",", "."));
  }
  return Number(compact);
}

function extractNote(
  raw: string,
  priceIndex: number,
  priceLength: number,
  isIncome: boolean,
): string {
  let note = `${raw.slice(0, priceIndex)} ${raw.slice(priceIndex + priceLength)}`;
  if (note.startsWith("+")) note = note.slice(1);
  note = note.replace(CURRENCY_TOKEN_RE, " ");
  note = note.replace(KEYWORD_RE, " ");
  note = note.replace(/\s+/g, " ").trim();
  note = note.replace(/^[,.;:!?]+|[,.;:!?]+$/g, "").trim();
  if (!note) return isIncome ? "Income" : "Expense";
  return note;
}
