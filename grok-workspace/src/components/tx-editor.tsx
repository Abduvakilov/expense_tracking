import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useLedgerStore } from "@/lib/store";
import { CATEGORIES, CURRENCIES, type Transaction, type TxType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TxEditor({
  tx,
  onClose,
}: {
  tx: Transaction | null;
  onClose: () => void;
}) {
  const people = useLedgerStore((s) => s.people);
  const updateTransaction = useLedgerStore((s) => s.updateTransaction);
  const deleteTransaction = useLedgerStore((s) => s.deleteTransaction);

  const [note, setNote] = useState("");
  const [absAmount, setAbsAmount] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [personId, setPersonId] = useState("");
  const [when, setWhen] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!tx) return;
    setNote(tx.note);
    setAbsAmount(String(Math.abs(tx.amount)));
    setType(tx.type);
    setCurrency(tx.currency);
    setCategory(tx.category);
    setPersonId(tx.personId);
    setWhen(tx.createdAt.slice(0, 10));
  }, [tx]);

  const current = tx;

  function save() {
    if (!current) return;
    const n = Number(absAmount.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(n) || n === 0) {
      toast("Enter an amount");
      return;
    }
    const iso = when
      ? new Date(`${when}T12:00:00`).toISOString()
      : current.createdAt;
    updateTransaction(current.id, {
      note: note.trim() || current.note,
      amount: type === "income" ? n : -n,
      type,
      currency,
      category,
      personId,
      createdAt: iso,
    });
    toast("Updated");
    onClose();
  }

  return (
    <>
      <Sheet open={Boolean(current)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit entry</SheetTitle>
            <SheetDescription>Adjust the line, then save.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="note">Note</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={absAmount}
                  onChange={(e) => setAbsAmount(e.target.value)}
                  className="tabular"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="when">When</Label>
                <Input
                  id="when"
                  type="date"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={cn(
                    "h-11 flex-1 rounded-xl text-sm capitalize",
                    type === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <div className="flex gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={cn(
                      "h-11 flex-1 rounded-xl text-sm",
                      currency === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="h-11 w-full rounded-lg bg-secondary px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="person">Person</Label>
              <select
                id="person"
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="h-11 w-full rounded-lg bg-secondary px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <Button onClick={save}>Save</Button>
              <Button variant="outline" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this line?</AlertDialogTitle>
            <AlertDialogDescription>
              {current?.note ?? "This entry"} will be removed from the ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-primary-foreground"
              onClick={() => {
                if (!current) return;
                deleteTransaction(current.id);
                setConfirmDelete(false);
                onClose();
                toast("Deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
