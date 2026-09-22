import {
  findLatestTransaction,
  findTransactionByReply,
  insertTransaction,
  listBalances,
  undoLastTransaction,
  undoTransactionByMessage,
  updateTransaction,
  upsertUser,
} from "./db";
import { formatBalanceReport, formatRecorded, HELP_TEXT, formatAmount } from "./format";
import { hasFinancialIntent, parseOfdReceiptLinks, parseTransactionInputs } from "./parser";
import { displayName, parseCommand, sendMessage, type TelegramUpdate } from "./telegram";
import type { Env } from "./types";

const ok = () => Response.json({ status: "ok" }, { status: 200 });

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      if (request.method === "GET") {
        return Response.json({ status: "ok", service: "expense-tracking-bot" });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      if (env.WEBHOOK_SECRET) {
        const header = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
        if (header !== env.WEBHOOK_SECRET) {
          console.error("Rejected webhook: invalid secret token");
          return ok();
        }
      }

      let update: TelegramUpdate;
      try {
        update = (await request.json()) as TelegramUpdate;
      } catch (error) {
        console.error("Invalid JSON body", error);
        return ok();
      }

      ctx.waitUntil(handleUpdate(env, update));
      return ok();
    } catch (error) {
      console.error("fetch handler failed", error);
      return ok();
    }
  },
};

async function handleUpdate(env: Env, update: TelegramUpdate): Promise<void> {
  try {
    const message = update.message;
    if (!message?.text || !message.from || message.from.is_bot) return;

    const chatId = message.chat.id;
    const userId = message.from.id;
    const name = displayName(message.from);
    const text = message.text;
    const replyTo = message.message_id;
    const repliedMessageId = message.reply_to_message?.message_id;

    try {
      await upsertUser(env.DB, chatId, userId, name);
    } catch (error) {
      console.error("Failed to register user", error);
    }

    const command = parseCommand(text);
    if (command) {
      await handleCommand(env, chatId, userId, name, command.command, command.rest, replyTo, repliedMessageId);
      return;
    }

    const ofdTransactions = await parseOfdReceiptLinks(text);
    if (ofdTransactions.length > 0) {
      try {
        const confirmations: string[] = [];
        for (const parsed of ofdTransactions) {
          await insertTransaction(env.DB, {
            chatId,
            userId,
            name,
            amount: parsed.amount,
            currency: parsed.currency,
            note: parsed.note,
            category: parsed.category,
            messageId: message.message_id,
          });
          confirmations.push(
            formatRecorded(name, parsed.amount, parsed.currency, parsed.note, parsed.category),
          );
        }
        await sendMessage(env.BOT_TOKEN, chatId, confirmations.join("\n"), replyTo);
      } catch (error) {
        console.error("Failed to record OFD receipt transaction", error);
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
          "⚠️ Chekni saqlab bo'lmadi. Qayta urinib ko'ring.",
          replyTo,
        );
      }
      return;
    }

    const parsedTransactions = parseTransactionInputs(text);
    if (parsedTransactions.length > 0) {
      try {
        const confirmations: string[] = [];
        for (const parsed of parsedTransactions) {
          await insertTransaction(env.DB, {
            chatId,
            userId,
            name,
            amount: parsed.amount,
            currency: parsed.currency,
            note: parsed.note,
            category: parsed.category,
            messageId: message.message_id,
          });
          confirmations.push(
            formatRecorded(name, parsed.amount, parsed.currency, parsed.note, parsed.category),
          );
        }
        await sendMessage(env.BOT_TOKEN, chatId, confirmations.join("\n"), replyTo);
      } catch (error) {
        console.error("Failed to record transaction", error);
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
        "⚠️ Xaridni saqlab bo'lmadi. Qayta urinib ko'ring.",
          replyTo,
        );
      }
      return;
    }

    if (hasFinancialIntent(text)) {
      await sendMessage(
        env.BOT_TOKEN,
        chatId,
      '⚠️ Summa aniqlanmadi. Iltimos, narx kiriting (masalan: "Taxi 25$" yoki "Kartoshka 15 000").',
        replyTo,
      );
    }
  } catch (error) {
    console.error("handleUpdate failed", error);
  }
}

async function parseBalanceOverride(
  input: string,
  chatId: number,
  db: D1Database,
): Promise<{ currency: "UZS" | "USD" | "EUR"; previous: number; target: number; delta: number } | null> {
  const match = input.match(/^([+-]?\d[\d\s.,]*)\s*(UZS|USD|EUR|UZ|US|EU|SOM|SOUM|som|soum|usd|eur)?$/i);
  if (!match) return null;

  const rawAmount = match[1].replace(/\s+/g, "");
  const currencyValue = (match[2] ?? "UZS").toUpperCase();
  const currency = currencyValue === "US" || currencyValue === "USD" ? "USD"
    : currencyValue === "EU" || currencyValue === "EUR" ? "EUR"
    : currencyValue === "SOM" || currencyValue === "SOUM" ? "UZS"
    : currencyValue === "UZS" ? "UZS"
    : "UZS";

  const amount = parseNumericAmount(rawAmount);
  if (!Number.isFinite(amount)) return null;

  const { totals } = await listBalances(db, chatId);
  const previous = totals.find((row) => row.currency === currency)?.total ?? 0;

  return {
    currency,
    previous,
    target: amount,
    delta: amount - previous,
  };
}

function parseNumericAmount(value: string): number {
  const compact = value.replace(/\s+/g, "");
  if (!compact) return Number.NaN;
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

async function handleCommand(
  env: Env,
  chatId: number,
  userId: number,
  name: string,
  command: string,
  rest: string,
  replyTo: number,
  repliedMessageId?: number,
): Promise<void> {
  try {
    if (command === "/start" || command === "/help") {
      await sendMessage(env.BOT_TOKEN, chatId, HELP_TEXT, replyTo);
      return;
    }

    if (command === "/balance" || command === "/setbalance") {
      if (!rest.trim()) {
        const { users, totals } = await listBalances(env.DB, chatId);
        await sendMessage(env.BOT_TOKEN, chatId, formatBalanceReport(users, totals), replyTo);
        return;
      }

      const parsed = await parseBalanceOverride(rest.trim(), chatId, env.DB);
      if (!parsed) {
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
          "⚠️ Foydalanish: /balance 500000 yoki /setbalance 500000 UZS",
          replyTo,
        );
        return;
      }

      await insertTransaction(env.DB, {
        chatId,
        userId,
        name,
        amount: parsed.delta,
        currency: parsed.currency,
        note: "Guruh balansini o'zgartirish",
        category: "other",
      });

      await sendMessage(
        env.BOT_TOKEN,
        chatId,
        `💰 Guruh balansi yangilandi: ${formatAmount(parsed.previous, parsed.currency)} ${parsed.currency} → ${formatAmount(parsed.target, parsed.currency)} ${parsed.currency}`,
        replyTo,
      );
      return;
    }

    if (command === "/undo") {
      const deleted = repliedMessageId
        ? await undoTransactionByMessage(env.DB, chatId, userId, repliedMessageId)
        : await undoLastTransaction(env.DB, chatId, userId);
      if (!deleted) {
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
          `${name}, bu chatda bekor qilish uchun mos tranzaksiya yo'q.`,
          replyTo,
        );
        return;
      }
      await sendMessage(
        env.BOT_TOKEN,
        chatId,
        `🗑️ ${deleted.telegram_user} uchun bekor qilindi: ${formatAmount(deleted.amount, deleted.currency)} ${deleted.currency} (${deleted.note})`,
        replyTo,
      );
      return;
    }

    if (command === "/edit" || command === "/change") {
      if (!rest.trim()) {
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
          "✏️ /edit dan keyin yangi tranzaksiya yozing, masalan: /edit Taksi 30$",
          replyTo,
        );
        return;
      }

      const parsed = parseTransactionInputs(rest.trim());
      if (parsed.length === 0) {
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
          "⚠️ O'zgartirishni o'qib bo'lmadi. Misol: /edit Taksi 30$",
          replyTo,
        );
        return;
      }

      const replacement = parsed[0];
      const target = repliedMessageId
        ? await findTransactionByReply(env.DB, chatId, userId, repliedMessageId)
        : await findLatestTransaction(env.DB, chatId, userId);

      if (!target) {
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
          `${name}, bu chatda o'zgartirish uchun tranzaksiya yo'q. Biror xabarga javob bering yoki oxirgi elementga /edit ishlating.`,
          replyTo,
        );
        return;
      }

      await updateTransaction(env.DB, target.id, {
        amount: replacement.amount,
        currency: replacement.currency,
        note: replacement.note,
        category: replacement.category,
      });

      await sendMessage(
        env.BOT_TOKEN,
        chatId,
        `✏️ Yangilandi: ${formatAmount(replacement.amount, replacement.currency)} ${replacement.currency} (${replacement.note})`,
        replyTo,
      );
      return;
    }
  } catch (error) {
    console.error("handleCommand failed", command, error);
    await sendMessage(env.BOT_TOKEN, chatId, "⚠️ Noma'lum xatolik yuz berdi. Qayta urinib ko'ring.", replyTo);
  }
}
