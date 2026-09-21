import { describe, expect, it } from "vitest";
import { hasFinancialIntent, parseTransactionInput, parseTransactionInputs } from "./parser";
import { formatAmount, formatBalanceReport, formatRecorded } from "./format";
import { parseCommand } from "./telegram";

describe("parseTransactionInput", () => {
  it("Kartoshka 3kg 15 000", () => {
    expect(parseTransactionInput("Kartoshka 3kg 15 000")).toEqual({
      amount: -15000,
      currency: "UZS",
      note: "Kartoshka 3kg",
      type: "expense",
      category: "food",
    });
  });

  it("Doniyor kirim 2 000 000", () => {
    expect(parseTransactionInput("Doniyor kirim 2 000 000")).toEqual({
      amount: 2000000,
      currency: "UZS",
      note: "Doniyor",
      type: "income",
      category: "other",
    });
  });

  it("accepts Kirim at the beginning or end", () => {
    expect(parseTransactionInput("Kirim salary 2 000")).toEqual({
      amount: 2000,
      currency: "UZS",
      note: "salary",
      type: "income",
      category: "salary",
    });
    expect(parseTransactionInput("Salary kirim 2 000")).toEqual({
      amount: 2000,
      currency: "UZS",
      note: "Salary",
      type: "income",
      category: "salary",
    });
  });

  it("accepts bold Kirim markup", () => {
    expect(parseTransactionInput("*Kirim* salary 2 000")).toEqual({
      amount: 2000,
      currency: "UZS",
      note: "salary",
      type: "income",
      category: "salary",
    });
  });

  it("accepts Unicode bold Kirim", () => {
    expect(parseTransactionInput("𝐊𝐢𝐫𝐢𝐦 salary 2 000")).toEqual({
      amount: 2000,
      currency: "UZS",
      note: "salary",
      type: "income",
      category: "salary",
    });
  });

  it("kartoshka, sabzi, piyoz jami 60 000", () => {
    expect(parseTransactionInput("kartoshka, sabzi, piyoz jami 60 000")).toEqual({
      amount: -60000,
      currency: "UZS",
      note: "kartoshka, sabzi, piyoz",
      type: "expense",
      category: "food",
    });
  });

  it("Taxi 25$", () => {
    expect(parseTransactionInput("Taxi 25$")).toEqual({
      amount: -25,
      currency: "USD",
      note: "Taxi",
      type: "expense",
      category: "transport",
    });
  });

  it("1 000 eur", () => {
    expect(parseTransactionInput("1 000 eur")).toEqual({
      amount: -1000,
      currency: "EUR",
      note: "Expense",
      type: "expense",
      category: "other",
    });
  });

  it("dotted thousands and leading plus", () => {
    expect(parseTransactionInput("+1.000.000 salary")).toMatchObject({
      amount: 1000000,
      currency: "UZS",
      note: "salary",
      type: "income",
      category: "salary",
    });
  });

  it("returns null without a number", () => {
    expect(parseTransactionInput("kirim today")).toBeNull();
    expect(parseTransactionInput("hello everyone")).toBeNull();
  });

  it("parses multiple newline-separated transactions", () => {
    expect(parseTransactionInputs("Taxi 25$\nKartoshka 15 000")).toEqual([
      { amount: -25, currency: "USD", note: "Taxi", type: "expense", category: "transport" },
      { amount: -15000, currency: "UZS", note: "Kartoshka", type: "expense", category: "food" },
    ]);
  });

  it("parses note lines followed by amount lines as repeated transactions", () => {
    expect(parseTransactionInputs("Salary kirim\n1000000\n500$")).toEqual([
      { amount: 1000000, currency: "UZS", note: "Salary", type: "income", category: "salary" },
      { amount: 500, currency: "USD", note: "Salary", type: "income", category: "salary" },
    ]);
  });

  it("normalizes Cyrillic text and strips punctuation before categorisation", () => {
    expect(parseTransactionInput("Такси, 25$")) .toEqual({
      amount: -25,
      currency: "USD",
      note: "Taksi",
      type: "expense",
      category: "transport",
    });
  });

  it("folds accented letters and removes apostrophe separators before categorisation", () => {
    expect(parseTransactionInput("Tö'lov 25 000")).toMatchObject({
      amount: -25000,
      category: "bills",
    });
  });

  it.each(["tó'lov", "tò`lov", "tȯlov", "tôlov", "tölov", "tǒlov", "tŏlov", "tōlov", "tõlov"])(
    "categorises accented and separated %s as bills",
    (word) => {
      expect(parseTransactionInput(`${word} 25 000`)).toMatchObject({
        amount: -25000,
        category: "bills",
      });
    },
  );

  it("removes hyphens and punctuation before categorisation", () => {
    expect(parseTransactionInput("oziq-ovqat, 40 000")).toMatchObject({
      amount: -40000,
      category: "food",
    });
  });

  it("allows a category tag to override automatic categorisation", () => {
    expect(parseTransactionInput("Taxi 25$ #food")).toMatchObject({
      amount: -25,
      category: "food",
      note: "Taxi",
    });
  });

  it("supports Uzbek category aliases in manual tags", () => {
    expect(parseTransactionInput("Telefon 100 000 #tolov")).toMatchObject({
      amount: -100000,
      category: "bills",
      note: "Telefon",
    });
  });
});

describe("hasFinancialIntent", () => {
  it("detects keywords and ignores small talk", () => {
    expect(hasFinancialIntent("kirim today")).toBe(true);
    expect(hasFinancialIntent("chiqim later")).toBe(true);
    expect(hasFinancialIntent("hello everyone")).toBe(false);
  });
});

describe("format helpers", () => {
  it("formats signed UZS with spaces", () => {
    expect(formatAmount(-15000, "UZS")).toBe("-15 000");
    expect(formatAmount(2000000, "UZS")).toBe("+2 000 000");
  });

  it("formats recorded confirmation", () => {
    expect(formatRecorded("Ali", -15000, "UZS", "Kartoshka 3kg")).toBe(
      "✓ -15 000 UZS",
    );
    expect(formatRecorded("Ali", -15000, "UZS", "Kartoshka 3kg", "food")).toBe(
      "✓ -15 000 UZS • food",
    );
  });

  it("formats per-user and group totals", () => {
    const text = formatBalanceReport(
      [
        { telegram_user: "Ali", telegram_user_id: 1, currency: "UZS", total: -15000 },
        { telegram_user: "Ali", telegram_user_id: 1, currency: "USD", total: -25 },
      ],
      [
        { currency: "UZS", total: -15000 },
        { currency: "USD", total: -25 },
      ],
    );
    expect(text).toContain("👤 Ali");
    expect(text).toContain("UZS: -15 000");
    expect(text).toContain("USD: -25");
    expect(text).toContain("EUR: 0");
    expect(text).toContain("Group totals");
  });
});

describe("parseCommand", () => {
  it("strips bot mention suffix", () => {
    expect(parseCommand("/balance@ExpenseBot")).toEqual({ command: "/balance", rest: "" });
    expect(parseCommand("/undo please")).toEqual({ command: "/undo", rest: "please" });
  });
});
