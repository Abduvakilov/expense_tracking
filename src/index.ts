import { insertTransaction, listBalances, undoLastTransaction, upsertUser } from "./db";
import { formatBalanceReport, formatRecorded, HELP_TEXT, formatAmount } from "./format";
import { hasFinancialIntent, parseTransactionInputs } from "./parser";
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

    try {
      await upsertUser(env.DB, chatId, userId, name);
    } catch (error) {
      console.error("Failed to register user", error);
    }

    const command = parseCommand(text);
    if (command) {
      await handleCommand(env, chatId, userId, name, command.command, replyTo);
      return;
    }

    const parsedTransactions = parseTransactionInputs(text);
    if (parsedTransactions.length > 0) {
      try {
        for (const parsed of parsedTransactions) {
          await insertTransaction(env.DB, {
            chatId,
            userId,
            name,
            amount: parsed.amount,
            currency: parsed.currency,
            note: parsed.note,
          });
          await sendMessage(
            env.BOT_TOKEN,
            chatId,
            formatRecorded(name, parsed.amount, parsed.currency, parsed.note),
            replyTo,
          );
        }
      } catch (error) {
        console.error("Failed to record transaction", error);
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
          "⚠️ Could not save that transaction. Please try again.",
          replyTo,
        );
      }
      return;
    }

    if (hasFinancialIntent(text)) {
      await sendMessage(
        env.BOT_TOKEN,
        chatId,
        '⚠️ Could not detect an amount. Please include a price (e.g., "Taxi 25$" or "Kartoshka 15 000").',
        replyTo,
      );
    }
  } catch (error) {
    console.error("handleUpdate failed", error);
  }
}

async function handleCommand(
  env: Env,
  chatId: number,
  userId: number,
  name: string,
  command: string,
  replyTo: number,
): Promise<void> {
  try {
    if (command === "/start" || command === "/help") {
      await sendMessage(env.BOT_TOKEN, chatId, HELP_TEXT, replyTo);
      return;
    }

    if (command === "/balance") {
      const { users, totals } = await listBalances(env.DB, chatId);
      await sendMessage(env.BOT_TOKEN, chatId, formatBalanceReport(users, totals), replyTo);
      return;
    }

    if (command === "/undo") {
      const deleted = await undoLastTransaction(env.DB, chatId, userId);
      if (!deleted) {
        await sendMessage(env.BOT_TOKEN, chatId, `${name}, you have no transactions to undo in this chat.`, replyTo);
        return;
      }
      await sendMessage(
        env.BOT_TOKEN,
        chatId,
        `🗑️ Undone for ${deleted.telegram_user}: ${formatAmount(deleted.amount, deleted.currency)} ${deleted.currency} (${deleted.note})`,
        replyTo,
      );
      return;
    }
  } catch (error) {
    console.error("handleCommand failed", command, error);
    await sendMessage(env.BOT_TOKEN, chatId, "⚠️ Something went wrong. Please try again.", replyTo);
  }
}
