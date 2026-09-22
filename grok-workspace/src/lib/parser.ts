import { inferCategory } from "./categories";
import type { CategoryId, Currency, ParsedTransaction } from "./types";

const OFD_URL_RE = /(?:https?:\/\/)?(?:new-)?ofd\.soliq\.uz\/check(?:\?[^\s]*)?/gi;
const KEYWORD_RE = /\b(?:kirim|chiqim|jami)\b/gi;
const CURRENCY_TOKEN_RE =
  /\$|€|\b(?:usd|eur|soum|som|uzs|sum)\b|(?<=\d)s\b|\bs\b/gi;
const CATEGORY_TAG_RE = /(?:^|\s)#([a-z][a-z'-]*)/i;

/** Standalone numbers, including space/dot thousand groups. Not 3kg. */
const STANDALONE_NUMBER_RE =
  /(?<![A-Za-z])\d+(?:[.\s]\d{3})*(?:[.,]\d{1,2})?(?![A-Za-z])/g;

export function hasFinancialIntent(text: string): boolean {
  const t = normalizeInput(text).trim();
  if (!t) return false;
  if (t.startsWith("+")) return true;
  if (/\b(?:kirim|chiqim|jami)\b/i.test(t)) return true;
  if (/[€$]/.test(t)) return true;
  if (/\b(?:usd|eur|soum|som|uzs|sum)\b/i.test(t)) return true;
  return false;
}

export function parseTransactionInput(text: string): ParsedTransaction | null {
  if (/(?:https?:\/\/)?(?:new-)?ofd\.soliq\.uz\/check/i.test(text)) {
    return null;
  }

  const raw = normalizeInput(text).trim().replace(/[ *_~`]/g, " ");
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
  const category = detectCategory(raw, note, isIncome);

  return {
    amount,
    currency,
    note,
    type: isIncome ? "income" : "expense",
    category,
  };
}

export async function parseOfdReceiptUrl(url: string): Promise<ParsedTransaction[] | null> {
  const details = parseOfdReceiptParams(url);
  if (!details) return null;

  const ts = Math.floor(Date.now() / 1000);
  const payload = `${details.terminalId}:${details.paymentNo}:${ts}`;
  const key = "thisIsPaymentSecretKey123@#";
  const cryptoApi = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
  if (!cryptoApi || !cryptoApi.subtle) {
    throw new Error("Web Crypto API is unavailable");
  }

  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(key);
  const dataBuffer = encoder.encode(payload);
  const imported = await cryptoApi.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await cryptoApi.subtle.sign("HMAC", imported, dataBuffer);
  const hex = Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const response = await fetch("https://new-ofd.soliq.uz/api/payment", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Timestamp": String(ts),
      "X-Signature": hex,
    },
    body: JSON.stringify({
      terminalId: details.terminalId,
      paymentNo: details.paymentNo,
      paymentDate: details.paymentDate,
      fiscalSign: details.fiscalSign,
      paymentType: "CHECK",
    }),
  });

  if (!response.ok) return null;

  const payloadJson = (await response.json()) as { data?: { paymentDetails?: Array<{ name?: string; price?: number }> } };
  const items = payloadJson?.data?.paymentDetails ?? [];

  const rows: ParsedTransaction[] = [];
  for (const item of items) {
    const name = String(item?.name ?? "Receipt item").trim();
    const price = Number(item?.price ?? 0);
    if (!name || !Number.isFinite(price) || price <= 0) continue;
    rows.push({
      amount: -Math.round(price),
      currency: "UZS",
      note: name,
      type: "expense",
      category: inferCategory(name, "expense"),
    });
  }

  return rows.length > 0 ? rows : null;
}

export async function parseOfdReceiptLinks(text: string): Promise<ParsedTransaction[]> {
  const urls = new Set(
    [...text.matchAll(OFD_URL_RE)]
      .map((match) => match[0].trim())
      .filter((value) => value.length > 0),
  );

  if (urls.size === 0) return [];

  const transactions: ParsedTransaction[] = [];
  for (const url of urls) {
    const parsed = await parseOfdReceiptUrl(url);
    if (parsed) transactions.push(...parsed);
  }
  return transactions;
}

export function parseTransactionInputs(text: string): ParsedTransaction[] {
  return text
    .split(/\r?\n/)
    .map((line) => parseTransactionInput(line))
    .filter((parsed): parsed is ParsedTransaction => parsed !== null);
}

function parseOfdReceiptParams(value: string): { terminalId: string; paymentNo: string; paymentDate: string; fiscalSign: string } | null {
  const raw = value.trim();
  if (!raw) return null;

  const candidate = raw.includes("://") ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    if (!hostname.endsWith("ofd.soliq.uz") && hostname !== "new-ofd.soliq.uz") return null;
    const terminalId = url.searchParams.get("t");
    const paymentNo = url.searchParams.get("r");
    const paymentDate = url.searchParams.get("c");
    const fiscalSign = url.searchParams.get("s");
    if (!terminalId || !paymentNo || !paymentDate || !fiscalSign) return null;
    return { terminalId, paymentNo, paymentDate, fiscalSign };
  } catch {
    return null;
  }
}

function normalizeInput(text: string): string {
  return [...text]
    .map((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      if (codePoint >= 0x1d400 && codePoint <= 0x1d433) {
        return String.fromCharCode(
          codePoint <= 0x1d419
            ? codePoint - 0x1d400 + 0x41
            : codePoint - 0x1d41a + 0x61,
        );
      }
      return character;
    })
    .join("")
    .replace(/[\u200b-\u200d\ufeff]/g, "");
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
  note = note.replace(CATEGORY_TAG_RE, " ");
  note = note.replace(KEYWORD_RE, " ");
  note = note.replace(/\s+/g, " ").trim();
  note = note.replace(/^[,.;:!?]+|[,.;:!?]+$/g, "").trim();
  if (!note) return isIncome ? "Income" : "Expense";
  return note;
}

function detectCategory(raw: string, note: string, isIncome: boolean): CategoryId {
  const tag = raw.match(CATEGORY_TAG_RE)?.[1];
  if (tag) {
    const aliases: Record<string, CategoryId> = {
      food: "food",
      ovqat: "food",
      transport: "transport",
      shopping: "shopping",
      xarid: "shopping",
      housing: "housing",
      uyjoy: "housing",
      uy: "housing",
      health: "health",
      sogliq: "health",
      education: "education",
      talim: "education",
      entertainment: "entertainment",
      kongilochar: "entertainment",
      bills: "bills",
      tolov: "bills",
      gift: "gifts",
      gifts: "gifts",
      sovga: "gifts",
      travel: "travel",
      work: "work",
      salary: "work",
      maosh: "work",
      other: "other",
      boshqa: "other",
    };
    const normalized = normalizeCategoryText(tag);
    const explicit = aliases[normalized];
    if (explicit) return explicit;
  }

  return inferCategory(normalizeCategoryText(`${raw} ${note}`), isIncome ? "income" : "expense");
}

function normalizeCategoryText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
