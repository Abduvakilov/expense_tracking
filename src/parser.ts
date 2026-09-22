import type { Currency, ParsedTransaction, TransactionCategory } from "./types";

const OFD_URL_RE = /(?:https?:\/\/)?(?:new-)?ofd\.soliq\.uz\/check(?:\?[^\s]*)?/gi;
const KEYWORD_RE = /\b(?:kirim|chiqim|jami)\b/gi;
const CURRENCY_TOKEN_RE =
  /\$|€|\b(?:usd|eur|soum|som)\b|(?<=\d)s\b|\bs\b/gi;

/** Standalone numbers, including space/dot thousand groups. Not 3kg. */
const STANDALONE_NUMBER_RE =
  /(?<![A-Za-z])\d+(?:[.\s]\d{3})*(?:[.,]\d{1,2})?(?![A-Za-z])/g;
const CATEGORY_TAG_RE = /(?:^|\s)#([a-z][a-z'-]*)/i;

const EXPENSE_CATEGORY_RULES: Array<[TransactionCategory, RegExp]> = [
  ["food", /\b(?:kartoshka|sabzi|piyoz|banan|ovqat|oziqovqat|mahsulot|bozor|dokon|oshxona|osh|taom|non|nonushta|tushlik|kechki ovqat|buyurtma|yetkazib berish|gosht|baliq|tovuq|meva|sabzavot|shakar|qand|yogurt|sut|qatiq|kefir|tuz|murch|baqlajon|pomidor|bodring|guruch|makaron|moy|un|choy|qahva|shirinlik|muzqaymoq|somsa|manti|lagmon|shorva|kabob|lavash|pizza|kolbasa|suv|ichimlik|gazlangan|mineral)\b/i],
  ["transport", /\b(?:taksi|taxi|avtobus|metro|poyezd|poezd|mashina|avtomobil|avto|yol haqi|yol kira|benzin|yoqilgi|gaz|moy|shina|ehtiyot qism|tamirlash|haydovchi|bekat|bilet|samolyot|transport)\b/i],
  ["housing", /\b(?:ijara|uy|xonadon|kvartira|hovli|yotoqxona|uyjoy|bino|xona|qurilish|tamirlash|boyoq|mebel|jihoz|matras|konditsioner|kommunal|elektr|elektr toki|suv|gaz|issiqlik|isitish|sovutish|internet|wifi)\b/i],
  ["health", /\b(?:shifoxona|poliklinika|klinika|doktor|shifokor|dori|doridarmon|dorixona|vitamin|tahlil|analiz|davolanish|muolaja|salomatlik|sogliq|tish|tish shifokori|tez yordam|jarrohlik|korik)\b/i],
  ["education", /\b(?:kurs|oquv kursi|maktab|universitet|oliygoh|kollej|talim|dars|oqish|oqituvchi|ustoz|kitob|daftar|qalam|imtihon|kontrakt|stipendiya|maktab formasi)\b/i],
  ["entertainment", /\b(?:kino|film|teatr|konsert|musiqa|qoshiq|park|sayr|dam olish|sport|futbol|tennis|oyin|oyinkulgi|tadbir|tomosha|muzey|basseyn|zal)\b/i],
  ["bills", /\b(?:tolov|hisob|qarz|komissiya|kommunal|elektr|suv|gaz|internet|wifi|telefon|mobil aloqa|sim karta|tarif|abonent tolovi|jarima|soliq|chek)\b/i],
  ["gifts", /\b(?:sovga|hadya|tugilgan kun|toy|nikoh|bayram|mehmon|mehmondorchilik|duo|marosim|chaqaloq|tabrik)\b/i],
  ["travel", /\b(?:safar|sayohat|mehmonxona|yotoq|aviachipta|samolyot|poyezd|yol|tur|dam olish maskani|viza|pasport|bagaj|bilet)\b/i],
  ["shopping", /\b(?:xarid|sotib olish|olish|dokon|bozor|kiyim|ustbosh|poyabzal|koylak|shim|kurtka|palto|romol|sumka|soat|telefon|kompyuter|noutbuk|quloqchin|elektronika|aksessuar|oyinchoq|idish|uyrozgor)\b/i],
];

const INCOME_CATEGORY_RULES: Array<[TransactionCategory, RegExp]> = [
  ["salary", /\b(?:salary|maosh|ishhaq|oylik|paycheck|pension|stipendiya|daromad|ish|ish haqi|menejment|zarp|zarpata|qarz)\b/i],
];

export function hasFinancialIntent(text: string): boolean {
  const t = normalizeInput(text).trim();
  if (!t) return false;
  if (t.startsWith("+")) return true;
  if (/\b(?:kirim|chiqim|jami)\b/i.test(t)) return true;
  if (/[€$]/.test(t)) return true;
  if (/\b(?:usd|eur|soum|som)\b/i.test(t)) return true;
  return false;
}

export async function parseOfdReceiptUrl(url: string): Promise<ParsedTransaction[] | null> {
  const details = parseOfdReceiptParams(url);
  if (!details) return null;

  const response = await fetch("https://new-ofd.soliq.uz/api/payment", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(await buildOfdHeaders(details.terminalId, details.paymentNo)),
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

  const payload = (await response.json()) as { data?: { paymentDetails?: Array<{ name?: string; price?: number }> } };
  const detailsList = payload?.data?.paymentDetails ?? [];

  const parsed: ParsedTransaction[] = [];

  for (const item of detailsList) {
    const name = String(item?.name ?? "Receipt item").trim();
    const price = Number(item?.price ?? 0);
    if (!name || !Number.isFinite(price) || price <= 0) continue;

    const category = detectCategory(normalizeCategoryText(name), false, name);
    parsed.push({
      amount: -Math.round(price),
      currency: "UZS",
      note: name,
      type: "expense",
      category,
    });
  }

  return parsed.length > 0 ? parsed : null;
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

export function parseTransactionInput(text: string): ParsedTransaction | null {
  if (/(?:https?:\/\/)?(?:new-)?ofd\.soliq\.uz\/check/i.test(text)) {
    return null;
  }

  const raw = normalizeInput(text).trim().replace(/[`]/g, "").replace(/[ *_~]/g, " ");
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
  const explicitCategory = detectExplicitCategory(raw);
  const note = extractNote(raw, last.index ?? 0, token.length, isIncome);
  const category = explicitCategory ?? detectCategory(raw, isIncome, note);

  return {
    amount,
    currency,
    note,
    type: isIncome ? "income" : "expense",
    category,
  };
}

function detectExplicitCategory(text: string): TransactionCategory | null {
  const match = text.match(CATEGORY_TAG_RE);
  if (!match) return null;

  const category = normalizeCategoryText(match[1]);
  const aliases: Record<string, TransactionCategory> = {
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
    salary: "salary",
    maosh: "salary",
    other: "other",
    boshqa: "other",
  };

  return aliases[category] ?? null;
}

export function parseTransactionInputs(text: string): ParsedTransaction[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => normalizeInput(line).trim())
    .filter((line) => line.length > 0);

  const parsed: ParsedTransaction[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const direct = parseTransactionInput(line);
    if (direct) {
      parsed.push(direct);
      continue;
    }

    if (!hasFinancialIntent(line)) continue;

    let nextIndex = index + 1;
    let foundAmount = false;

    while (nextIndex < lines.length) {
      const candidate = parseTransactionInput(`${line} ${lines[nextIndex]}`);
      if (!candidate) {
        const nextLine = lines[nextIndex];
        if (nextLine && !/\d/.test(nextLine) && hasFinancialIntent(nextLine)) {
          break;
        }
        break;
      }

      parsed.push(candidate);
      foundAmount = true;
      nextIndex += 1;
    }

    if (foundAmount) {
      index = nextIndex - 1;
    }
  }

  return parsed;
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

async function buildOfdHeaders(terminalId: string, paymentNo: string): Promise<Record<string, string>> {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `${terminalId}:${paymentNo}:${timestamp}`;
  const key = "thisIsPaymentSecretKey123@#";
  const cryptoApi = (globalThis as any).crypto;
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

  return {
    "X-Timestamp": String(timestamp),
    "X-Signature": hex,
  };
}

function normalizeInput(text: string): string {
  return [...text]
    .map((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      if (codePoint >= 0x1d400 && codePoint <= 0x1d433) {
        return String.fromCharCode(
          codePoint <= 0x1d419 ? codePoint - 0x1d400 + 0x41 : codePoint - 0x1d41a + 0x61,
        );
      }
      return character;
    })
    .join("")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/[\u0400-\u04FF]/g, (char) => transliterateCyrillic(char));
}

function transliterateCyrillic(char: string): string {
  const map: Record<string, string> = {
    А: "A", а: "a", Б: "B", б: "b", В: "V", в: "v", Г: "G", г: "g", Д: "D", д: "d",
    Е: "E", е: "e", Ё: "Yo", ё: "yo", Ж: "Zh", ж: "zh", З: "Z", з: "z", И: "I", и: "i",
    Й: "Y", й: "y", К: "K", к: "k", Л: "L", л: "l", М: "M", м: "m", Н: "N", н: "n",
    О: "O", о: "o", П: "P", п: "p", Р: "R", р: "r", С: "S", с: "s", Т: "T", т: "t",
    У: "U", у: "u", Ф: "F", ф: "f", Х: "X", х: "x", Ц: "Ts", ц: "ts", Ч: "Ch", ч: "ch",
    Ш: "Sh", ш: "sh", Ы: "Y", ы: "y", Ь: "", ь: "",
    Э: "E", э: "e", Ю: "Yu", ю: "yu", Я: "Ya", я: "ya",
    Ў: "O'", ў: "o'", Қ: "Q", қ: "q", Ғ: "G'", ғ: "g'",
    Ҳ: "H", ҳ: "h", 
  };

  return map[char] ?? char;
}

function detectCurrency(text: string): Currency {
  const lower = text.toLowerCase();
  if (lower.includes("$") || lower.includes("usd")) return "USD";
  if (lower.includes("€") || lower.includes("eur")) return "EUR";
  return "UZS";
}

function detectCategory(raw: string, isIncome: boolean, note: string): TransactionCategory {
  const source = normalizeCategoryText(`${raw} ${note}`);

  if (isIncome) {
    const match = INCOME_CATEGORY_RULES.find(([, pattern]) => pattern.test(source));
    return match?.[0] ?? "other";
  }

  const match = EXPENSE_CATEGORY_RULES.find(([, pattern]) => pattern.test(source));
  return match?.[0] ?? "other";
}

function normalizeCategoryText(text: string): string {
  let normalized = "";
  const folded = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  for (const character of folded) {
    if (
      (character >= "a" && character <= "z") ||
      (character >= "0" && character <= "9") ||
      character === " "
    ) {
      normalized += character;
    } else if ("'-’ʻʼ`ʽʾˈˊˋ˴＇‐‑‒–—―".includes(character)) {
      continue;
    } else {
      normalized += " ";
    }
  }

  return normalized.replace(/ +/g, " ").trim();
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
  note = note.replace(CATEGORY_TAG_RE, " ");
  note = note.replace(/\s+/g, " ").trim();
  note = note.replace(/^[,.;:!?]+|[,.;:!?]+$/g, "").trim();
  if (!note) return isIncome ? "Income" : "Expense";
  return note;
}
