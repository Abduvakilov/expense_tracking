import { addMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight, Cloud, CloudOff, Download, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BalanceCards, PeopleStrip } from "@/components/balance-cards";
import { CategoryPanel } from "@/components/category-panel";
import { Composer } from "@/components/composer";
import { HelpDialog } from "@/components/help-dialog";
import { MonthChart } from "@/components/month-chart";
import { SettingsPanel } from "@/components/settings-panel";
import { TransactionList } from "@/components/transaction-list";
import { TxEditor } from "@/components/tx-editor";
import { TelegramAuthGate } from "@/components/telegram-auth-gate";
import { Button } from "@/components/ui/button";
import { bootstrapLedger, refreshLedger, shiftMonth, useLedgerStore } from "@/lib/store";
import { flushSyncQueue, readSyncQueue } from "@/lib/sync";
import type { Transaction } from "@/lib/types";

function exportCsv() {
  const { transactions, people } = useLedgerStore.getState();
  const header = ["date", "person", "type", "category", "note", "amount", "currency"];
  const lines = transactions.map((t) => {
    const person = people.find((p) => p.id === t.personId)?.name ?? "";
    const note = `"${t.note.replaceAll('"', '""')}"`;
    return [t.createdAt, person, t.type, t.category, note, t.amount, t.currency].join(",");
  });
  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hisob.csv";
  a.click();
  URL.revokeObjectURL(url);
  toast("Exported CSV");
}

function LedgerContent() {
  const isSample = useLedgerStore((s) => s.isSample);
  const month = useLedgerStore((s) => s.month);
  const setMonth = useLedgerStore((s) => s.setMonth);
  const startFresh = useLedgerStore((s) => s.startFresh);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [queuedCount, setQueuedCount] = useState(() => readSyncQueue().length);

  useEffect(() => {
    void bootstrapLedger();

    const syncOnlineStatus = () => {
      const online = typeof navigator === "undefined" ? true : navigator.onLine;
      setIsOnline(online);
      if (online) {
        void flushSyncQueue().then(() => setQueuedCount(readSyncQueue().length));
      } else {
        setQueuedCount(readSyncQueue().length);
      }
    };

    syncOnlineStatus();
    const refreshTimer = window.setInterval(() => {
      if (navigator.onLine) {
        void refreshLedger().catch(() => undefined);
      }
    }, 1000);
    window.addEventListener("online", syncOnlineStatus);
    window.addEventListener("offline", syncOnlineStatus);

    return () => {
      window.removeEventListener("online", syncOnlineStatus);
      window.removeEventListener("offline", syncOnlineStatus);
      window.clearInterval(refreshTimer);
    };
  }, []);

  const monthDate = new Date(`${month}T00:00:00`);
  const monthLabel = format(monthDate, "MMMM yyyy");
  const canGoForward = addMonths(monthDate, 1) <= new Date();

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-6 pb-12">
        <header className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Household ledger
            </p>
            <h1 className="font-display text-4xl leading-none tracking-tight">Hisob</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card px-2 py-1 shadow-[var(--shadow-border)] text-xs text-muted-foreground">
            {isOnline ? <Cloud className="size-3.5" /> : <CloudOff className="size-3.5" />}
            <span>{isOnline ? "Online" : "Offline"}</span>
            {queuedCount > 0 && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-foreground">{queuedCount} queued</span>}
          </div>
          <div className="flex items-center rounded-full bg-card p-1 shadow-[var(--shadow-border)]">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() => setMonth(shiftMonth(month, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 px-2 text-center text-sm">{monthLabel}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              disabled={!canGoForward}
              onClick={() => setMonth(shiftMonth(month, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" aria-label="Export CSV" onClick={exportCsv}>
            <Download className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="size-4" />
          </Button>
        </header>

        {isSample && (
          <div className="flex flex-col gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)] sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-muted-foreground">
              Sample household — log a line of your own, or start a blank ledger.
            </p>
            <Button variant="outline" size="sm" onClick={startFresh}>
              Start fresh
            </Button>
          </div>
        )}

        <Composer onHelp={() => setHelpOpen(true)} />

        <BalanceCards />
        <PeopleStrip />

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <MonthChart />
          <CategoryPanel />
        </div>

        <TransactionList onSelect={setEditing} />
      </div>

      <TxEditor tx={editing} onClose={() => setEditing(null)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

export function LedgerApp() {
  return (
    <TelegramAuthGate>
      {() => <LedgerContent />}
    </TelegramAuthGate>
  );
}
