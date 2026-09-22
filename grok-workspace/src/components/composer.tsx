import { ArrowUp, CircleHelp, Undo2, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { formatWithCode } from "@/lib/format";
import { hasFinancialIntent, parseTransactionInputs } from "@/lib/parser";
import { useLedgerStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Kartoshka 3kg 15 000",
  "Taxi 25$",
  "Doniyor kirim 2 000 000",
  "1 000 eur",
];

export function Composer({
  onHelp,
  className,
}: {
  onHelp: () => void;
  className?: string;
}) {
  const people = useLedgerStore((s) => s.people);
  const activePersonId = useLedgerStore((s) => s.activePersonId);
  const setActivePerson = useLedgerStore((s) => s.setActivePerson);
  const logText = useLedgerStore((s) => s.logText);
  const logTextAsync = useLedgerStore((s) => s.logTextAsync);
  const undo = useLedgerStore((s) => s.undo);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  const parsed = useMemo(() => parseTransactionInputs(value), [value]);
  const intentWithoutAmount =
    parsed.length === 0 && value.trim().length > 0 && hasFinancialIntent(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("/")) {
      handleCommand(trimmed);
      return;
    }

    const rows = await logTextAsync(trimmed);
    if (rows.length === 0) {
      setError(
        intentWithoutAmount || hasFinancialIntent(trimmed)
          ? "Could not detect an amount. Include a price, like Taxi 25$."
          : "Need a number — the last number is the amount.",
      );
      return;
    }
    setError(null);
    setValue("");
    const first = rows[0];
    toast(
      rows.length === 1
        ? `Logged ${formatWithCode(first.amount, first.currency)}`
        : `Logged ${rows.length} lines`,
    );
  }

  function handleCommand(raw: string) {
    const cmd = raw.split(/\s+/)[0]?.toLowerCase() ?? "";
    if (cmd === "/undo") {
      const batch = undo();
      toast(batch ? "Undone" : "Nothing to undo");
      setValue("");
      setError(null);
      return;
    }
    if (cmd === "/help" || cmd === "/start") {
      onHelp();
      setValue("");
      setError(null);
      return;
    }
    setError("Commands: /undo  /help");
  }

  const person = people.find((p) => p.id === activePersonId) ?? people[0];

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-3xl bg-card p-2 shadow-[var(--shadow-border)]">
        <Textarea
          ref={ref}
          value={value}
          rows={1}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="Type like a message — Kartoshka 3kg 15 000"
          className="min-h-12 px-3 py-3 text-base md:text-sm"
          aria-label="Log a transaction"
        />
        <div className="flex items-center gap-1.5 px-1 pb-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 pl-2 pr-2.5 text-muted-foreground">
                <User className="size-3.5" />
                <span className="max-w-24 truncate">{person?.name ?? "You"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {people.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onSelect={() => setActivePerson(p.id)}
                  className={cn(p.id === activePersonId && "bg-secondary")}
                >
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Help"
            onClick={onHelp}
            className="text-muted-foreground"
          >
            <CircleHelp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Undo last"
            onClick={() => {
              const batch = undo();
              toast(batch ? "Undone" : "Nothing to undo");
            }}
            className="text-muted-foreground"
          >
            <Undo2 className="size-4" />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {parsed.length > 0 && (
              <p className="hidden max-w-56 truncate text-xs text-muted-foreground sm:block">
                <span
                  className={cn(
                    "tabular font-medium",
                    parsed[0].amount >= 0 ? "text-income" : "text-expense",
                  )}
                >
                  {formatWithCode(parsed[0].amount, parsed[0].currency)}
                </span>
                {parsed.length > 1 ? ` · +${parsed.length - 1}` : ` · ${parsed[0].note}`}
              </p>
            )}
            <Button
              size="icon-sm"
              aria-label="Log"
              onClick={() => void submit()}
              disabled={!value.trim()}
              className="rounded-full"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 px-3 text-xs text-expense" role="alert">
          {error}
        </p>
      )}
      {intentWithoutAmount && !error && (
        <p className="mt-2 px-3 text-xs text-muted-foreground">
          Include a price (e.g. Taxi 25$ or Kartoshka 15 000).
        </p>
      )}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setValue(example);
              setError(null);
              ref.current?.focus();
            }}
            className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
