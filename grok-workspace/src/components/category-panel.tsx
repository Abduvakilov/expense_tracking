import { currencyForChart } from "@/components/balance-cards";
import { categoryLabel } from "@/lib/categories";
import { formatAbs } from "@/lib/format";
import { categorySpend, inMonth, useLedgerStore } from "@/lib/store";

export function CategoryPanel() {
  const transactions = useLedgerStore((s) => s.transactions);
  const month = useLedgerStore((s) => s.month);
  const currencyFilter = useLedgerStore((s) => s.currencyFilter);
  const monthRows = transactions.filter((t) => inMonth(t.createdAt, month));
  const chartCurrency = currencyForChart(currencyFilter);
  const top = categorySpend(monthRows, chartCurrency).slice(0, 6);
  const peak = top[0]?.total ?? 0;

  return (
    <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Categories
        </h2>
        <p className="text-xs text-muted-foreground">{chartCurrency} spend</p>
      </div>
      {top.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No expenses to group yet
        </p>
      ) : (
        <ul className="space-y-3">
          {top.map((row) => (
            <li key={row.id}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm">{categoryLabel(row.id)}</span>
                <span className="shrink-0 text-sm whitespace-nowrap tabular text-muted-foreground">
                  {formatAbs(row.total, chartCurrency)}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary/65"
                  style={{ width: `${peak ? (row.total / peak) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
