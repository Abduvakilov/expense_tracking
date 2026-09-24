import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authenticateTelegram, getTelegramUser, signOutTelegram, type TelegramUser } from "@/lib/telegram-auth";
import { Button } from "@/components/ui/button";

type TelegramLoginPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramLoginPayload) => void;
  }
}

export function TelegramAuthGate({ children }: { children: (user: TelegramUser) => ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;

  useEffect(() => {
    void getTelegramUser()
      .then(setUser)
      .catch(() => setError("Could not check Telegram session"))
      .finally(() => setPending(false));
  }, []);

  useEffect(() => {
    if (user || !botUsername) return;
    const container = document.getElementById("telegram-login-widget");
    if (!container) return;
    window.onTelegramAuth = (payload) => {
      setError(null);
      void authenticateTelegram({ data: payload })
        .then(setUser)
        .catch((reason: unknown) => {
          setError(reason instanceof Error ? reason.message : "Telegram login failed");
        });
    };
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.dataset.telegramLogin = botUsername;
    script.dataset.size = "large";
    script.dataset.userpic = "false";
    script.dataset.requestAccess = "write";
    script.dataset.onauth = "onTelegramAuth(user)";
    container.replaceChildren(script);
    return () => {
      delete window.onTelegramAuth;
      container.replaceChildren();
    };
  }, [botUsername, user]);

  if (pending) {
    return <main className="grid min-h-dvh place-items-center p-6 text-muted-foreground">Checking Telegram session…</main>;
  }
  if (!user) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-6">
        <section className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Private ledger</p>
          <h1 className="mt-2 font-display text-4xl">Hisob</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Sign in with Telegram to access only your own ledger data.
          </p>
          {botUsername ? (
            <div id="telegram-login-widget" className="mt-6 flex justify-center" />
          ) : (
            <p className="mt-6 text-sm text-destructive">Telegram login is not configured.</p>
          )}
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </section>
      </main>
    );
  }
  return (
    <>
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2 rounded-full bg-card px-3 py-2 text-xs shadow-[var(--shadow-border)]">
        <span>{user.name}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void signOutTelegram().then(() => setUser(null))}
        >
          Sign out
        </Button>
      </div>
      {children(user)}
    </>
  );
}
