import type { Currency, TransactionCategory } from "./types";

const CURRENCIES: Currency[] = ["UZS", "USD", "EUR"];

export function formatAmount(amount: number, currency: Currency): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  const abs = Math.abs(amount);

  if (currency === "UZS") {
    return `${sign}${groupThousands(Math.round(abs), " ")}`;
  }

  const hasFraction = Math.abs(abs - Math.round(abs)) > 1e-9;
  const body = hasFraction
    ? abs.toFixed(2)
    : groupThousands(Math.round(abs), ",");
  return `${sign}${body}`;
}

function groupThousands(value: number, separator: string): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function formatRecorded(
  _name: string,
  amount: number,
  currency: Currency,
  _note: string,
  category?: TransactionCategory,
): string {
  const details = category ? ` • ${translateCategory(category)}` : "";
  return `✓ ${formatAmount(amount, currency)} ${currency}${details}`;
}

function translateCategory(category: TransactionCategory): string {
  const map: Record<TransactionCategory, string> = {
    food: "ovqat",
    transport: "transport",
    housing: "uy",
    health: "salomatlik",
    education: "ta'lim",
    entertainment: "ko'ngilochar",
    bills: "to'lovlar",
    gifts: "sovgalar",
    travel: "sayohat",
    shopping: "xaridlar",
    work: "ish",
    other: "boshqa",
  };
  return map[category] ?? category;
}

export const HELP_TEXT = `Sarflar hisobi bot

Bu chatga xabar yozing — oxirgi raqam summa bo'ladi.

• Xarajat (standart): Kartoshka 3kg 15 000
• Kirim: + bilan boshlang yoki "kirim" so'zini yozing
• Kategoriya avtomatik aniqlanadi: ovqat, transport, to'lovlar, maosh va boshqalar
• Kategoriyani qo'lda kiritish mumkin: Taksi 25$ #transport
• O'zbekcha teglar ham ishlaydi: osh 25 000 #ovqat
• Sovgalar uchun: Tort 250 000 #gift

Kategoriyalar:
#food — ovqat
#transport — transport
#housing — uy
#health — salomatlik
#education — ta'lim
#entertainment — ko'ngilochar
#bills — to'lovlar
#gifts — sovgalar
#travel — sayohat
#shopping — xaridlar
#work — ish
#other — boshqa

Valyutalar alohida yuritiladi — konvertatsiya qilinmaydi:
UZS (standart), USD ($ / usd), EUR (€ / eur)

Misollar
• Kartoshka 3kg 15 000
• Doniyor kirim 2 000 000
• kartoshka, sabzi, piyoz jami 60 000
• Taksi 25$
• +1000 usd
• 1 000 eur

Buyruqlar
/balance — bu chatdagi foydalanuvchilar va guruh balanslari
/balance 500000 — bu guruhning UZS balansini 500000 ga o'rnatadi
/setbalance 500000 UZS — guruh balansini aniq o'rnatish
/undo — oxirgi yozuvni o'chirish yoki javob berilgan xabarni bekor qilish
/edit — yozuvni o'zgartirish, masalan: /edit Taksi 30$ #transport
/change — /edit ning qisqartmasi
/help — bu xabar

Guruhda botga xabarlarni ko'rishga ruxsat berish uchun:
BotFather → /setprivacy → Disable`;

export function formatBalanceReport(
  rows: Array<{ telegram_user: string; telegram_user_id: number; currency: Currency; total: number }>,
  totals: Array<{ currency: Currency; total: number }>,
): string {
  if (rows.length === 0) {
    return "📊 Hali bu chatda hech qanday tranzaksiya yo'q.";
  }

  const byUser = new Map<
    number,
    { name: string; sums: Partial<Record<Currency, number>> }
  >();

  for (const row of rows) {
    const existing = byUser.get(row.telegram_user_id);
    if (existing) {
      existing.sums[row.currency] = row.total;
      existing.name = row.telegram_user;
    } else {
      byUser.set(row.telegram_user_id, {
        name: row.telegram_user,
        sums: { [row.currency]: row.total },
      });
    }
  }

  const lines: string[] = ["📊 Balanslar"];

  for (const { name, sums } of byUser.values()) {
    lines.push("");
    lines.push(`👤 ${name}`);
    for (const currency of CURRENCIES) {
      const value = sums[currency] ?? 0;
      lines.push(`  ${currency}: ${formatAmount(value, currency)}`);
    }
  }

  const totalMap: Partial<Record<Currency, number>> = {};
  for (const row of totals) totalMap[row.currency] = row.total;

  lines.push("");
  lines.push("────────");
  lines.push("👥 Guruh yig'indisi");
  for (const currency of CURRENCIES) {
    const value = totalMap[currency] ?? 0;
    lines.push(`  ${currency}: ${formatAmount(value, currency)}`);
  }

  return lines.join("\n");
}
