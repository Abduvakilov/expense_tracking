import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { categoryLabel } from "@/lib/categories";
import { formatWithCode } from "@/lib/format";
import { inMonth, useLedgerStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

function dayLabel(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE d MMM");
}

export function TransactionList({
  onSelect,
}: {
  onSelect: (tx: Transaction) => void;
}) {
  const transactions = useLedgerStore((s) => s.transactions);
  const people = useLedgerStore((s) => s.people);
  const month = useLedgerStore((s) => s.month);
  const typeFilter = useLedgerStore((s) => s.typeFilter);
  const currencyFilter = useLedgerStore((s) => s.currencyFilter);
  const search = useLedgerStore((s) => s.search);
  const setTypeFilter = useLedgerStore((s) => s.setTypeFilter);
  const setSearch = useLedgerStore((s) => s.setSearch);

  const q = search.trim().toLowerCase();
  const rows = transactions.filter((t) => {
    if (!inMonth(t.createdAt, month)) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (currencyFilter !== "all" && t.currency !== currencyFilter) return false;
    if (q) {
      const person = people.find((p) => p.id === t.personId)?.name ?? "";
      return `${t.note} ${person} ${t.category}`.toLowerCase().includes(q);
    }
    return true;
  });

  const groups: { label: string; items: Transaction[] }[] = [];
  for (const row of rows) {
    const label = dayLabel(row.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(row);
    else groups.push({ label, items: [row] });
  }

  return (
    <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Activity
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "expense", "income"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTypeFilter(key)}
              className={cn(
                "h-11 rounded-full px-3.5 text-xs font-medium capitalize transition-colors",
                typeFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {key === "all" ? "All" : key}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes, people"
          className="pl-9"
          aria-label="Search transactions"
        />
      </div>
      {groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing in this month. Type a line above to log one.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {groups.map((group) => (
            <div key={group.label} className="py-3 first:pt-0 last:pb-0">
              <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                {group.label}
              </p>
              <ul>
                {group.items.map((tx) => {
                  const person = people.find((p) => p.id === tx.personId)?.name ?? "—";
                  return (
                    <li key={tx.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(tx)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary/80"
                      >
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            tx.amount >= 0 ? "bg-income" : "bg-expense",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{tx.note}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{person}</span>
                            <Badge variant="default" className="px-2 py-0">
                              {categoryLabel(tx.category)}
                            </Badge>
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-right text-sm font-medium whitespace-nowrap tabular",
                            tx.amount >= 0 ? "text-income" : "text-foreground",
                          )}
                        >
                          {formatWithCode(tx.amount, tx.currency)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
