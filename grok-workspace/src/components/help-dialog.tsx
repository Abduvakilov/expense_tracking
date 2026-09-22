import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RULES = [
  { sample: "Kartoshka 3kg 15 000", result: "Expense · 15 000 UZS" },
  { sample: "Doniyor kirim 2 000 000", result: "Income · 2 000 000 UZS" },
  { sample: "Taxi 25$", result: "Expense · 25 USD" },
  { sample: "1 000 eur", result: "Expense · 1 000 EUR" },
  { sample: "+1000 usd", result: "Income · 1 000 USD" },
  { sample: "https://ofd.soliq.uz/check?t=...&s=...", result: "Parsed as OFD receipt items" },
];

export function HelpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write it like a chat</DialogTitle>
          <DialogDescription>
            The last number is the amount. Default currency is UZS. Currencies stay
            separate — no conversion.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {RULES.map((row) => (
            <li key={row.sample} className="flex flex-col gap-0.5">
              <span className="font-mono text-sm">{row.sample}</span>
              <span className="text-xs text-muted-foreground">{row.result}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Start with + or include <span className="text-foreground">kirim</span> for
          income. OFD links are parsed as receipt items, not as a single amount. Multiple
          lines log together. Commands: /undo, /help.
        </p>
      </DialogContent>
    </Dialog>
  );
}
