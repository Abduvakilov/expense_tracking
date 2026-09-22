import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatAbs } from "@/lib/format";
import { useLedgerStore } from "@/lib/store";
import { CURRENCIES } from "@/lib/types";

export function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const people = useLedgerStore((s) => s.people);
  const budgets = useLedgerStore((s) => s.budgets);
  const addPerson = useLedgerStore((s) => s.addPerson);
  const renamePerson = useLedgerStore((s) => s.renamePerson);
  const removePerson = useLedgerStore((s) => s.removePerson);
  const setBudget = useLedgerStore((s) => s.setBudget);
  const startFresh = useLedgerStore((s) => s.startFresh);
  const restoreSample = useLedgerStore((s) => s.restoreSample);
  const [newName, setNewName] = useState("");

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Household</SheetTitle>
          <SheetDescription>
            People, monthly budgets, and the sample ledger.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              People
            </h3>
            <ul className="space-y-2">
              {people.map((person) => (
                <li key={person.id} className="flex items-center gap-2">
                  <Input
                    value={person.name}
                    onChange={(e) => renamePerson(person.id, e.target.value)}
                    aria-label={`${person.name} name`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={people.length <= 1}
                    onClick={() => removePerson(person.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addPerson(newName);
                setNewName("");
              }}
            >
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Add a person"
              />
              <Button type="submit" variant="secondary">
                Add
              </Button>
            </form>
          </section>
          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Monthly budgets
            </h3>
            <p className="text-xs text-muted-foreground">
              Compared against this month’s expenses. Leave empty for no cap.
            </p>
            {CURRENCIES.map((currency) => {
              const current = budgets.find((b) => b.currency === currency)?.monthlyLimit ?? 0;
              return (
                <div key={currency} className="space-y-1.5">
                  <Label htmlFor={`budget-${currency}`}>
                    {currency}
                    {current > 0 ? ` · ${formatAbs(current, currency)}` : ""}
                  </Label>
                  <Input
                    id={`budget-${currency}`}
                    inputMode="decimal"
                    defaultValue={current || ""}
                    placeholder="0"
                    className="tabular"
                    onBlur={(e) => {
                      const n = Number(e.target.value.replace(/\s/g, "").replace(",", "."));
                      setBudget(currency, Number.isFinite(n) ? n : 0);
                    }}
                  />
                </div>
              );
            })}
          </section>
          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Data
            </h3>
            <p className="text-xs text-muted-foreground">
              Everything stays on this device. Clearing the sample starts a blank household.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  startFresh();
                  onClose();
                  toast("Blank ledger");
                }}
              >
                Start fresh
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  restoreSample();
                  onClose();
                  toast("Sample household restored");
                }}
              >
                Restore sample
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
