import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { currencyForChart } from "@/components/balance-cards";
import { formatAbs } from "@/lib/format";
import { inMonth, monthBounds, useLedgerStore } from "@/lib/store";
import type { Currency } from "@/lib/types";

type DayPoint = { label: string; day: number; expense: number; income: number };

function buildDays(monthIso: string, currency: Currency, txs: ReturnType<typeof useLedgerStore.getState>["transactions"]): DayPoint[] {
  const { start, end } = monthBounds(monthIso);
  const days = Math.round((end.getTime() - start.getTime()) / 86400000);
  const points: DayPoint[] = Array.from({ length: days }, (_, i) => ({
    label: String(i + 1),
    day: i + 1,
    expense: 0,
    income: 0,
  }));
  for (const tx of txs) {
    if (!inMonth(tx.createdAt, monthIso)) continue;
    if (tx.currency !== currency) continue;
    const day = new Date(tx.createdAt).getDate();
    const point = points[day - 1];
    if (!point) continue;
    if (tx.amount < 0) point.expense += Math.abs(tx.amount);
    else point.income += tx.amount;
  }
  return points;
}

export function MonthChart() {
  const transactions = useLedgerStore((s) => s.transactions);
  const month = useLedgerStore((s) => s.month);
  const currencyFilter = useLedgerStore((s) => s.currencyFilter);
  const currency = currencyForChart(currencyFilter);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const data = useMemo(
    () => buildDays(month, currency, transactions),
    [month, currency, transactions],
  );

  const hasBars = data.some((d) => d.expense > 0 || d.income > 0);

  return (
    <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Daily {currency}
        </h2>
        <p className="text-xs text-muted-foreground">Spend vs in</p>
      </div>
      <div className="h-44">
        {!mounted ? (
          <div className="h-full rounded-2xl bg-secondary/60" />
        ) : !hasBars ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No movement this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={1} barCategoryGap="18%">
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={4}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-secondary)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0]?.payload as DayPoint;
                  return (
                    <div className="rounded-xl bg-popover px-3 py-2 text-xs shadow-[var(--shadow-border)]">
                      <p className="mb-1 text-muted-foreground">Day {label}</p>
                      <p className="text-expense tabular">
                        −{formatAbs(point.expense, currency)} {currency}
                      </p>
                      <p className="text-income tabular">
                        +{formatAbs(point.income, currency)} {currency}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                radius={[3, 3, 0, 0]}
                maxBarSize={10}
              />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[3, 3, 0, 0]}
                maxBarSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
