export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
}

export interface TelegramMessage {
  message_id: number;
  date: number;
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
  reply_to_message?: TelegramMessage;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export function displayName(user: TelegramUser): string {
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.username) return user.username;
  return `User ${user.id}`;
}

export function parseCommand(text: string): { command: string; rest: string } | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) return null;
  const [head, ...restParts] = trimmed.split(/\s+/);
  const command = head.split("@")[0].toLowerCase();
  return { command, rest: restParts.join(" ").trim() };
}

export async function sendMessage(
  botToken: string,
  chatId: number,
  text: string,
  replyToMessageId?: number,
): Promise<void> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_to_message_id: replyToMessageId,
        allow_sending_without_reply: true,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("Telegram sendMessage failed", response.status, body);
    }
  } catch (error) {
    console.error("Telegram sendMessage threw", error);
  }
}
