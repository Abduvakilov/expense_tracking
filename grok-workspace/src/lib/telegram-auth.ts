import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

const COOKIE_NAME = "__Host-telegram-session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type TelegramUser = {
  id: string;
  name: string;
  username: string | null;
};

type TelegramLoginPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

async function botToken(): Promise<string> {
  if (process.env.TELEGRAM_BOT_TOKEN) return process.env.TELEGRAM_BOT_TOKEN;
  const cloudflare = await import("cloudflare:workers");
  const token = cloudflare.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return token;
}

async function hmac(key: Uint8Array, value: string): Promise<ArrayBuffer> {
  const imported = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", imported, new TextEncoder().encode(value));
}

function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function encode(value: string): string {
  return btoa(unescape(encodeURIComponent(value))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decode(value: string): string {
  return decodeURIComponent(escape(atob(value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4))));
}

function readCookie(): string | null {
  const cookies = getRequestHeader("cookie") ?? "";
  for (const part of cookies.split(/;\s*/)) {
    const separator = part.indexOf("=");
    if (separator > 0 && part.slice(0, separator) === COOKIE_NAME) return part.slice(separator + 1);
  }
  return null;
}

async function signSession(payload: string): Promise<string> {
  return `${payload}.${hex(await hmac(new TextEncoder().encode(await botToken()), payload))}`;
}

async function verifySession(value: string): Promise<TelegramUser | null> {
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;
  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = hex(await hmac(new TextEncoder().encode(await botToken()), payload));
  if (!constantTimeEqual(signature, expected)) return null;
  try {
    const parsed = JSON.parse(decode(payload)) as TelegramUser & { issuedAt: number };
    if (!parsed.id || Date.now() / 1000 - parsed.issuedAt > MAX_AGE_SECONDS) return null;
    return { id: parsed.id, name: parsed.name, username: parsed.username };
  } catch {
    return null;
  }
}

export const telegramAuthMiddleware = createMiddleware({ type: "function" })
  .server(async ({ next }) => {
    const session = await verifySession(readCookie() ?? "");
    if (!session) throw new Error("Unauthorized");
    return next({ context: { telegramUser: session } });
  });

export const getTelegramUser = createServerFn({ method: "GET" }).handler(async () => {
  return verifySession(readCookie() ?? "");
});

export const authenticateTelegram = createServerFn({ method: "POST" })
  .validator((input: TelegramLoginPayload) => input)
  .handler(async ({ data }) => {
    const token = await botToken();
    const { hash, ...fields } = data;
    const dataCheckString = Object.entries(fields)
      .filter(([, value]) => value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    const secret = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const expected = hex(await hmac(new Uint8Array(secret), dataCheckString));
    if (!constantTimeEqual(hash, expected) || Date.now() / 1000 - data.auth_date > 86400) {
      throw new Error("Invalid Telegram authentication");
    }

    const user: TelegramUser = {
      id: String(data.id),
      name: [data.first_name, data.last_name].filter(Boolean).join(" "),
      username: data.username ?? null,
    };
    const payload = encode(JSON.stringify({ ...user, issuedAt: Math.floor(Date.now() / 1000) }));
    setResponseHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${await signSession(payload)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`,
    );
    return user;
  });

export const signOutTelegram = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
  return { signedOut: true };
});
