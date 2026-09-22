import { formatAbs, formatAmount } from "@/lib/format";
import {
  expenseByCurrency,
  incomeByCurrency,
  inMonth,
  sumsByCurrency,
  useLedgerStore,
} from "@/lib/store";
import type { Currency } from "@/lib/types";
import { CURRENCIES } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BalanceCards() {
  const transactions = useLedgerStore((s) => s.transactions);
  const month = useLedgerStore((s) => s.month);
  const budgets = useLedgerStore((s) => s.budgets);
  const currencyFilter = useLedgerStore((s) => s.currencyFilter);
  const setCurrencyFilter = useLedgerStore((s) => s.setCurrencyFilter);

  const allTime = sumsByCurrency(transactions);
  const monthRows = transactions.filter((t) => inMonth(t.createdAt, month));
  const monthIn = incomeByCurrency(monthRows);
  const monthOut = expenseByCurrency(monthRows);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {CURRENCIES.map((currency) => {
        const net = allTime[currency];
        const budget = budgets.find((b) => b.currency === currency)?.monthlyLimit ?? 0;
        const spent = monthOut[currency];
        const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0;
        const selected = currencyFilter === currency;
        return (
          <button
            key={currency}
            type="button"
            onClick={() => setCurrencyFilter(selected ? "all" : currency)}
            className={cn(
              "rounded-3xl bg-card p-5 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)]",
              selected && "shadow-[var(--shadow-border-hover)]",
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                {currency}
              </p>
              <p className="text-xs text-muted-foreground">all time</p>
            </div>
            <p className="font-display mt-3 text-2xl leading-none tracking-tight text-nowrap whitespace-nowrap tabular">
              {formatAmount(net, currency)}
            </p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="text-income whitespace-nowrap tabular">
                +{formatAbs(monthIn[currency], currency)}
              </span>
              <span className="text-expense whitespace-nowrap tabular">
                −{formatAbs(monthOut[currency], currency)}
              </span>
              <span>this month</span>
            </p>
            {budget > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between gap-2 text-xs text-muted-foreground">
                  <span>Budget</span>
                  <span className="whitespace-nowrap tabular">
                    {formatAbs(spent, currency)} / {formatAbs(budget, currency)}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-[var(--motion-fast)]",
                      ratio > 0.9 ? "bg-expense" : "bg-primary/70",
                    )}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function PeopleStrip() {
  const transactions = useLedgerStore((s) => s.transactions);
  const people = useLedgerStore((s) => s.people);
  const month = useLedgerStore((s) => s.month);
  const currencyFilter = useLedgerStore((s) => s.currencyFilter);
  const monthRows = transactions.filter((t) => inMonth(t.createdAt, month));
  const currency = currencyForChart(currencyFilter);

  if (people.length < 2) return null;

  return (
    <section className="space-y-2">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        This month · {currency}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {people.map((person) => {
        const sum = monthRows
          .filter((t) => t.personId === person.id && t.currency === currency)
          .reduce((acc, t) => acc + t.amount, 0);
        return (
          <div
            key={person.id}
            className="min-w-36 flex-1 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
          >
            <p className="truncate text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {person.name}
            </p>
            <p
              className={cn(
                "font-display mt-1 text-lg leading-none text-nowrap whitespace-nowrap tabular",
                sum > 0 ? "text-income" : sum < 0 ? "text-expense" : "text-foreground",
              )}
            >
              {formatAmount(sum, currency)}
            </p>
          </div>
        );
      })}
      </div>
    </section>
  );
}

export function currencyForChart(filter: "all" | Currency): Currency {
  return filter === "all" ? "UZS" : filter;
}
