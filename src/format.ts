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
  const details = category ? ` • ${category}` : "";
  return `✓ ${formatAmount(amount, currency)} ${currency}${details}`;
}

export const HELP_TEXT = `Expense tracker

Write a message in this chat to log a transaction. The last number is the amount.

• Expense (default): Kartoshka 3kg 15 000
• Income: start with + or include "kirim"
• Categories are inferred automatically (food, transport, bills, salary, etc.)
• Choose a category manually with a tag: Taxi 25$ #transport
  Uzbek tags also work: osh 25 000 #ovqat
• Currencies stay separate — no conversion
  UZS (default), USD ($ / usd), EUR (€ / eur)

Examples
• Kartoshka 3kg 15 000
• Doniyor kirim 2 000 000
• kartoshka, sabzi, piyoz jami 60 000
• Taxi 25$
• +1000 usd
• 1 000 eur

Commands
/balance — per-user and group totals by currency
/undo — delete your most recent record in this chat, or reply to a message to undo that entry
/edit — replace a record by replying to it or by updating your latest item, e.g. /edit Taxi 30$ #transport
/change — alias for /edit
/help — this message

In groups, disable privacy mode so the bot can see messages:
BotFather → /setprivacy → Disable`;

export function formatBalanceReport(
  rows: Array<{ telegram_user: string; telegram_user_id: number; currency: Currency; total: number }>,
  totals: Array<{ currency: Currency; total: number }>,
): string {
  if (rows.length === 0) {
    return "📊 No transactions recorded in this chat yet.";
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

  const lines: string[] = ["📊 Balances"];

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
  lines.push("👥 Group totals");
  for (const currency of CURRENCIES) {
    const value = totalMap[currency] ?? 0;
    lines.push(`  ${currency}: ${formatAmount(value, currency)}`);
  }

  return lines.join("\n");
}
