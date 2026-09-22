import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, k as Slot, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as Settings2, c as CircleHelp, d as ArrowUp, l as ChevronRight, n as User, o as Search, r as Undo2, s as Download, t as X, u as ChevronLeft } from "../_libs/lucide-react.mjs";
import { a as Separator2, i as Root2$1, n as Item2, o as Trigger, r as Portal2$1, t as Content2$1 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as cn } from "./router-BKmUy8-8.mjs";
import { a as addMonths, i as format, n as isYesterday, r as isToday, t as parseISO } from "../_libs/date-fns.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as Tooltip, i as ResponsiveContainer, n as XAxis, r as Bar, t as BarChart } from "../_libs/recharts+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bwosxd7N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatAmount(amount, currency) {
	const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";
	const abs = Math.abs(amount);
	if (currency === "UZS") return `${sign}${groupThousands(Math.round(abs), "\xA0")}`;
	return `${sign}${Math.abs(abs - Math.round(abs)) > 1e-9 ? abs.toFixed(2) : groupThousands(Math.round(abs), ",")}`;
}
function formatAbs(amount, currency) {
	return formatAmount(Math.abs(amount), currency).replace(/^[+−]/, "");
}
function formatWithCode(amount, currency) {
	return `${formatAmount(amount, currency)} ${currency}`;
}
function groupThousands(value, separator) {
	return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
var CURRENCIES = [
	"UZS",
	"USD",
	"EUR"
];
var CATEGORIES = [
	{
		id: "groceries",
		label: "Groceries"
	},
	{
		id: "dining",
		label: "Dining"
	},
	{
		id: "transport",
		label: "Transport"
	},
	{
		id: "housing",
		label: "Housing"
	},
	{
		id: "utilities",
		label: "Utilities"
	},
	{
		id: "health",
		label: "Health"
	},
	{
		id: "shopping",
		label: "Shopping"
	},
	{
		id: "work",
		label: "Work"
	},
	{
		id: "entertainment",
		label: "Leisure"
	},
	{
		id: "income",
		label: "Income"
	},
	{
		id: "other",
		label: "Other"
	}
];
var RULES$1 = [
	{
		id: "groceries",
		pattern: /\b(kartoshka|sabzi|piyoz|non|bread|milk|sut|grocery|grocer|supermarket|bazar|bozor|fruit|meva|meat|gosht|guruch|oil|yogurt|market|ovqat)\b/i
	},
	{
		id: "dining",
		pattern: /\b(cafe|coffee|kofe|osh|somsa|lavash|restaurant|restoran|lunch|dinner|tea|choy|pizza|burger|oshxona|fastfood)\b/i
	},
	{
		id: "transport",
		pattern: /\b(taxi|uber|yandex|bus|metro|fuel|petrol|benz|benzin|parking|avtobus|yo.?l)\b/i
	},
	{
		id: "housing",
		pattern: /\b(rent|ijara|mortgage|kvartira|uy|house)\b/i
	},
	{
		id: "utilities",
		pattern: /\b(internet|wifi|kommunal|electricity|tok|gas|gaz|water|suv|utility|kommunalka)\b/i
	},
	{
		id: "health",
		pattern: /\b(dori|pharmacy|apteka|doctor|clinic|klinika|stomatolog|dentist|hospital)\b/i
	},
	{
		id: "shopping",
		pattern: /\b(clothes|kiyim|mall|uzum|wildberries|shop|store|magazin|amazon)\b/i
	},
	{
		id: "work",
		pattern: /\b(office|coworking|ofis|freelance|software|saas|domain)\b/i
	},
	{
		id: "entertainment",
		pattern: /\b(kino|cinema|netflix|club|game|steam|spotify|concert|konsert)\b/i
	},
	{
		id: "income",
		pattern: /\b(salary|maosh|stipend|bonus|freelance|payroll|oylik)\b/i
	}
];
function inferCategory(note, type) {
	if (type === "income") {
		for (const rule of RULES$1) {
			if (rule.id === "income") continue;
			if (rule.pattern.test(note)) return rule.id;
		}
		return "income";
	}
	for (const rule of RULES$1) if (rule.pattern.test(note)) return rule.id;
	return "other";
}
function categoryLabel(id) {
	return CATEGORIES.find((c) => c.id === id)?.label ?? "Other";
}
var KEYWORD_RE = /\b(?:kirim|chiqim|jami)\b/gi;
var CURRENCY_TOKEN_RE = /\$|€|\b(?:usd|eur|soum|som|uzs|sum)\b|(?<=\d)s\b|\bs\b/gi;
/** Standalone numbers, including space/dot thousand groups. Not 3kg. */
var STANDALONE_NUMBER_RE = /(?<![A-Za-z])\d+(?:[.\s]\d{3})*(?:[.,]\d{1,2})?(?![A-Za-z])/g;
function hasFinancialIntent(text) {
	const t = normalizeInput(text).trim();
	if (!t) return false;
	if (t.startsWith("+")) return true;
	if (/\b(?:kirim|chiqim|jami)\b/i.test(t)) return true;
	if (/[€$]/.test(t)) return true;
	if (/\b(?:usd|eur|soum|som|uzs|sum)\b/i.test(t)) return true;
	return false;
}
function parseTransactionInput(text) {
	const raw = normalizeInput(text).trim().replace(/[ *_~`]/g, " ");
	if (!raw) return null;
	const isIncome = raw.startsWith("+") || /\bkirim\b/i.test(raw);
	const currency = detectCurrency(raw);
	const matches = [...raw.matchAll(STANDALONE_NUMBER_RE)];
	if (matches.length === 0) return null;
	const last = matches[matches.length - 1];
	const token = last[0];
	const price = parsePriceToken(token);
	if (!Number.isFinite(price) || price === 0) return null;
	return {
		amount: isIncome ? price : -price,
		currency,
		note: extractNote(raw, last.index ?? 0, token.length, isIncome),
		type: isIncome ? "income" : "expense"
	};
}
function parseTransactionInputs(text) {
	return text.split(/\r?\n/).map((line) => parseTransactionInput(line)).filter((parsed) => parsed !== null);
}
function normalizeInput(text) {
	return [...text].map((character) => {
		const codePoint = character.codePointAt(0) ?? 0;
		if (codePoint >= 119808 && codePoint <= 119859) return String.fromCharCode(codePoint <= 119833 ? codePoint - 119808 + 65 : codePoint - 119834 + 97);
		return character;
	}).join("").replace(/[\u200b-\u200d\ufeff]/g, "");
}
function detectCurrency(text) {
	const lower = text.toLowerCase();
	if (lower.includes("$") || lower.includes("usd")) return "USD";
	if (lower.includes("€") || lower.includes("eur")) return "EUR";
	return "UZS";
}
function parsePriceToken(token) {
	const compact = token.replace(/\s/g, "");
	if (/^\d{1,3}(?:\.\d{3})+$/.test(compact)) return Number(compact.replace(/\./g, ""));
	if (/^\d{1,3}(?:,\d{3})+$/.test(compact)) return Number(compact.replace(/,/g, ""));
	if (/^\d+,\d{1,2}$/.test(compact)) return Number(compact.replace(",", "."));
	return Number(compact);
}
function extractNote(raw, priceIndex, priceLength, isIncome) {
	let note = `${raw.slice(0, priceIndex)} ${raw.slice(priceIndex + priceLength)}`;
	if (note.startsWith("+")) note = note.slice(1);
	note = note.replace(CURRENCY_TOKEN_RE, " ");
	note = note.replace(KEYWORD_RE, " ");
	note = note.replace(/\s+/g, " ").trim();
	note = note.replace(/^[,.;:!?]+|[,.;:!?]+$/g, "").trim();
	if (!note) return isIncome ? "Income" : "Expense";
	return note;
}
function todayUtcNoon() {
	const n = /* @__PURE__ */ new Date();
	return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 12, 0, 0, 0));
}
function atHours(base, daysAgo, hour) {
	const d = new Date(base.getTime());
	d.setUTCDate(d.getUTCDate() - daysAgo);
	d.setUTCHours(hour, 0, 0, 0);
	return d.toISOString();
}
function tx(id, partial) {
	const type = partial.type ?? (partial.amount >= 0 ? "income" : "expense");
	return {
		id,
		category: inferCategory(partial.note, type),
		type,
		amount: partial.amount,
		currency: partial.currency,
		note: partial.note,
		personId: partial.personId,
		createdAt: partial.createdAt
	};
}
var DEFAULT_PEOPLE = [
	{
		id: "you",
		name: "You"
	},
	{
		id: "doniyor",
		name: "Doniyor"
	},
	{
		id: "malika",
		name: "Malika"
	}
];
var DEFAULT_BUDGETS = [
	{
		currency: "UZS",
		monthlyLimit: 12e6
	},
	{
		currency: "USD",
		monthlyLimit: 400
	},
	{
		currency: "EUR",
		monthlyLimit: 200
	}
];
function buildSampleLedger(now = todayUtcNoon()) {
	return [
		tx("s01", {
			personId: "you",
			currency: "UZS",
			amount: 85e5,
			note: "Salary maosh",
			createdAt: atHours(now, 18, 9)
		}),
		tx("s02", {
			personId: "malika",
			currency: "UZS",
			amount: 62e5,
			note: "Malika kirim oylik",
			createdAt: atHours(now, 17, 10)
		}),
		tx("s03", {
			personId: "you",
			currency: "USD",
			amount: 480,
			note: "Freelance kirim",
			createdAt: atHours(now, 14, 16)
		}),
		tx("s04", {
			personId: "doniyor",
			currency: "EUR",
			amount: 220,
			note: "Client kirim",
			createdAt: atHours(now, 12, 11)
		}),
		tx("s05", {
			personId: "you",
			currency: "UZS",
			amount: -24e5,
			note: "Rent ijara",
			createdAt: atHours(now, 16, 12)
		}),
		tx("s06", {
			personId: "malika",
			currency: "UZS",
			amount: -18e4,
			note: "Internet wifi",
			createdAt: atHours(now, 15, 19)
		}),
		tx("s07", {
			personId: "you",
			currency: "UZS",
			amount: -32e4,
			note: "Kommunal tok",
			createdAt: atHours(now, 15, 19)
		}),
		tx("s08", {
			personId: "doniyor",
			currency: "UZS",
			amount: -85e3,
			note: "kartoshka, sabzi, piyoz jami",
			createdAt: atHours(now, 13, 18)
		}),
		tx("s09", {
			personId: "you",
			currency: "USD",
			amount: -25,
			note: "Taxi",
			createdAt: atHours(now, 12, 21)
		}),
		tx("s10", {
			personId: "malika",
			currency: "UZS",
			amount: -64e3,
			note: "Oshxona lunch",
			createdAt: atHours(now, 11, 13)
		}),
		tx("s11", {
			personId: "you",
			currency: "UZS",
			amount: -42e3,
			note: "Yandex",
			createdAt: atHours(now, 10, 8)
		}),
		tx("s12", {
			personId: "doniyor",
			currency: "EUR",
			amount: -38,
			note: "Cafe",
			createdAt: atHours(now, 9, 17)
		}),
		tx("s13", {
			personId: "malika",
			currency: "UZS",
			amount: -156e3,
			note: "Pharmacy apteka",
			createdAt: atHours(now, 8, 15)
		}),
		tx("s14", {
			personId: "you",
			currency: "UZS",
			amount: -21e4,
			note: "Uzum shopping",
			createdAt: atHours(now, 7, 20)
		}),
		tx("s15", {
			personId: "you",
			currency: "USD",
			amount: -14.5,
			note: "Netflix",
			createdAt: atHours(now, 7, 9)
		}),
		tx("s16", {
			personId: "doniyor",
			currency: "UZS",
			amount: -28e3,
			note: "Choy cafe",
			createdAt: atHours(now, 6, 16)
		}),
		tx("s17", {
			personId: "malika",
			currency: "UZS",
			amount: -95e3,
			note: "Bozor meva",
			createdAt: atHours(now, 5, 11)
		}),
		tx("s18", {
			personId: "you",
			currency: "UZS",
			amount: -18e3,
			note: "Metro",
			createdAt: atHours(now, 5, 8)
		}),
		tx("s19", {
			personId: "you",
			currency: "EUR",
			amount: -12,
			note: "Domain work",
			createdAt: atHours(now, 4, 14)
		}),
		tx("s20", {
			personId: "doniyor",
			currency: "USD",
			amount: -32,
			note: "Uber",
			createdAt: atHours(now, 4, 22)
		}),
		tx("s21", {
			personId: "malika",
			currency: "UZS",
			amount: -48e3,
			note: "Somsa lavash",
			createdAt: atHours(now, 3, 13)
		}),
		tx("s22", {
			personId: "you",
			currency: "UZS",
			amount: -72e3,
			note: "Kartoshka 3kg",
			createdAt: atHours(now, 2, 19)
		}),
		tx("s23", {
			personId: "you",
			currency: "UZS",
			amount: -15e3,
			note: "Taxi",
			createdAt: atHours(now, 1, 21)
		}),
		tx("s24", {
			personId: "malika",
			currency: "UZS",
			amount: -36e3,
			note: "Coffee kofe",
			createdAt: atHours(now, 1, 10)
		}),
		tx("s25", {
			personId: "doniyor",
			currency: "UZS",
			amount: -12e4,
			note: "Benzin",
			createdAt: atHours(now, 0, 9)
		}),
		tx("s26", {
			personId: "you",
			currency: "UZS",
			amount: 12e5,
			note: "Side project kirim",
			createdAt: atHours(now, 0, 15)
		})
	].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function currentMonthIso(date = /* @__PURE__ */ new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}
function sortTx(rows) {
	return [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
var useLedgerStore = create()(persist((set, get) => ({
	isSample: true,
	people: DEFAULT_PEOPLE,
	activePersonId: "you",
	transactions: buildSampleLedger(),
	budgets: DEFAULT_BUDGETS,
	undoStack: [],
	month: currentMonthIso(),
	typeFilter: "all",
	currencyFilter: "all",
	search: "",
	setMonth: (isoMonth) => set({ month: isoMonth }),
	setTypeFilter: (value) => set({ typeFilter: value }),
	setCurrencyFilter: (value) => set({ currencyFilter: value }),
	setSearch: (value) => set({ search: value }),
	setActivePerson: (id) => set({ activePersonId: id }),
	logText: (text, createdAt) => {
		const parsed = parseTransactionInputs(text);
		if (parsed.length === 0) return [];
		const personId = get().activePersonId;
		const stamp = createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
		const rows = parsed.map((p, index) => ({
			id: crypto.randomUUID(),
			amount: p.amount,
			currency: p.currency,
			note: p.note,
			type: p.type,
			category: inferCategory(p.note, p.type),
			personId,
			createdAt: new Date(new Date(stamp).getTime() + index).toISOString()
		}));
		set((state) => ({
			isSample: false,
			transactions: sortTx([...rows, ...state.transactions]),
			undoStack: [rows.map((r) => r.id), ...state.undoStack].slice(0, 20)
		}));
		return rows;
	},
	addPerson: (name) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		const id = crypto.randomUUID();
		set((state) => ({
			people: [...state.people, {
				id,
				name: trimmed
			}],
			activePersonId: id
		}));
	},
	renamePerson: (id, name) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		set((state) => ({ people: state.people.map((p) => p.id === id ? {
			...p,
			name: trimmed
		} : p) }));
	},
	removePerson: (id) => {
		const { people, activePersonId, transactions } = get();
		if (people.length <= 1) return;
		const fallback = people.find((p) => p.id !== id)?.id;
		if (!fallback) return;
		set({
			people: people.filter((p) => p.id !== id),
			activePersonId: activePersonId === id ? fallback : activePersonId,
			transactions: transactions.map((t) => t.personId === id ? {
				...t,
				personId: fallback
			} : t)
		});
	},
	setBudget: (currency, monthlyLimit) => {
		set((state) => {
			const next = state.budgets.filter((b) => b.currency !== currency);
			if (monthlyLimit > 0) next.push({
				currency,
				monthlyLimit
			});
			return { budgets: next };
		});
	},
	updateTransaction: (id, patch) => {
		set((state) => ({
			isSample: false,
			transactions: sortTx(state.transactions.map((t) => {
				if (t.id !== id) return t;
				const next = {
					...t,
					...patch
				};
				if (patch.amount !== void 0) next.type = patch.amount >= 0 ? "income" : "expense";
				if (patch.type) {
					const abs = Math.abs(next.amount);
					next.amount = patch.type === "income" ? abs : -abs;
					next.type = patch.type;
				}
				if (patch.note !== void 0 || patch.type !== void 0) next.category = patch.category ?? inferCategory(next.note, next.type);
				return next;
			}))
		}));
	},
	deleteTransaction: (id) => {
		set((state) => ({
			isSample: false,
			transactions: state.transactions.filter((t) => t.id !== id)
		}));
	},
	undo: () => {
		const batch = get().undoStack[0];
		if (!batch) return null;
		set((state) => ({
			transactions: state.transactions.filter((t) => !batch.includes(t.id)),
			undoStack: state.undoStack.slice(1)
		}));
		return batch;
	},
	startFresh: () => {
		set({
			isSample: false,
			people: [{
				id: "you",
				name: "You"
			}],
			activePersonId: "you",
			transactions: [],
			budgets: [],
			undoStack: [],
			month: currentMonthIso(),
			typeFilter: "all",
			currencyFilter: "all",
			search: ""
		});
	},
	restoreSample: () => {
		set({
			isSample: true,
			people: DEFAULT_PEOPLE,
			activePersonId: "you",
			transactions: buildSampleLedger(),
			budgets: DEFAULT_BUDGETS,
			undoStack: [],
			month: currentMonthIso(),
			typeFilter: "all",
			currencyFilter: "all",
			search: ""
		});
	}
}), {
	name: "hisob-ledger-v3",
	skipHydration: true,
	partialize: (state) => ({
		isSample: state.isSample,
		people: state.people,
		activePersonId: state.activePersonId,
		transactions: state.transactions,
		budgets: state.budgets
	})
}));
function ensureLedgerReady() {
	const state = useLedgerStore.getState();
	if (state.isSample && state.transactions.length === 0) useLedgerStore.setState({ transactions: buildSampleLedger() });
}
var bootstrapPromise = null;
function bootstrapLedger() {
	if (!bootstrapPromise) bootstrapPromise = (async () => {
		await useLedgerStore.persist.rehydrate();
		ensureLedgerReady();
	})();
	return bootstrapPromise;
}
function monthBounds(monthIso) {
	const start = /* @__PURE__ */ new Date(`${monthIso}T00:00:00`);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	return {
		start,
		end
	};
}
function inMonth(iso, monthIso) {
	const { start, end } = monthBounds(monthIso);
	const t = new Date(iso).getTime();
	return t >= start.getTime() && t < end.getTime();
}
function shiftMonth(monthIso, delta) {
	const d = /* @__PURE__ */ new Date(`${monthIso}T00:00:00`);
	d.setMonth(d.getMonth() + delta);
	return currentMonthIso(d);
}
function sumsByCurrency(rows) {
	const sums = {
		UZS: 0,
		USD: 0,
		EUR: 0
	};
	for (const row of rows) sums[row.currency] += row.amount;
	return sums;
}
function expenseByCurrency(rows) {
	const sums = {
		UZS: 0,
		USD: 0,
		EUR: 0
	};
	for (const row of rows) if (row.amount < 0) sums[row.currency] += Math.abs(row.amount);
	return sums;
}
function incomeByCurrency(rows) {
	const sums = {
		UZS: 0,
		USD: 0,
		EUR: 0
	};
	for (const row of rows) if (row.amount > 0) sums[row.currency] += row.amount;
	return sums;
}
function categorySpend(rows, currency) {
	const map = /* @__PURE__ */ new Map();
	for (const row of rows) {
		if (row.amount >= 0) continue;
		if (currency !== "all" && row.currency !== currency) continue;
		map.set(row.category, (map.get(row.category) ?? 0) + Math.abs(row.amount));
	}
	return [...map.entries()].map(([id, total]) => ({
		id,
		label: id.charAt(0).toUpperCase() + id.slice(1),
		total
	})).sort((a, b) => b.total - a.total);
}
function BalanceCards() {
	const transactions = useLedgerStore((s) => s.transactions);
	const month = useLedgerStore((s) => s.month);
	const budgets = useLedgerStore((s) => s.budgets);
	const currencyFilter = useLedgerStore((s) => s.currencyFilter);
	const setCurrencyFilter = useLedgerStore((s) => s.setCurrencyFilter);
	const allTime = sumsByCurrency(transactions);
	const monthRows = transactions.filter((t) => inMonth(t.createdAt, month));
	const monthIn = incomeByCurrency(monthRows);
	const monthOut = expenseByCurrency(monthRows);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 gap-3 md:grid-cols-3",
		children: CURRENCIES.map((currency) => {
			const net = allTime[currency];
			const budget = budgets.find((b) => b.currency === currency)?.monthlyLimit ?? 0;
			const spent = monthOut[currency];
			const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0;
			const selected = currencyFilter === currency;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setCurrencyFilter(selected ? "all" : currency),
				className: cn("rounded-3xl bg-card p-5 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)]", selected && "shadow-[var(--shadow-border-hover)]"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-widest text-muted-foreground uppercase",
							children: currency
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "all time"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display mt-3 text-2xl leading-none tracking-tight text-nowrap whitespace-nowrap tabular",
						children: formatAmount(net, currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-income whitespace-nowrap tabular",
								children: ["+", formatAbs(monthIn[currency], currency)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-expense whitespace-nowrap tabular",
								children: ["−", formatAbs(monthOut[currency], currency)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "this month" })
						]
					}),
					budget > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 flex justify-between gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Budget" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "whitespace-nowrap tabular",
								children: [
									formatAbs(spent, currency),
									" / ",
									formatAbs(budget, currency)
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1 overflow-hidden rounded-full bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("h-full rounded-full transition-[width] duration-[var(--motion-fast)]", ratio > .9 ? "bg-expense" : "bg-primary/70"),
								style: { width: `${ratio * 100}%` }
							})
						})]
					})
				]
			}, currency);
		})
	});
}
function PeopleStrip() {
	const transactions = useLedgerStore((s) => s.transactions);
	const people = useLedgerStore((s) => s.people);
	const month = useLedgerStore((s) => s.month);
	const currencyFilter = useLedgerStore((s) => s.currencyFilter);
	const monthRows = transactions.filter((t) => inMonth(t.createdAt, month));
	const currency = currencyForChart(currencyFilter);
	if (people.length < 2) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs font-medium tracking-widest text-muted-foreground uppercase",
			children: ["This month · ", currency]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
			children: people.map((person) => {
				const sum = monthRows.filter((t) => t.personId === person.id && t.currency === currency).reduce((acc, t) => acc + t.amount, 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-36 flex-1 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs font-medium tracking-widest text-muted-foreground uppercase",
						children: person.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("font-display mt-1 text-lg leading-none text-nowrap whitespace-nowrap tabular", sum > 0 ? "text-income" : sum < 0 ? "text-expense" : "text-foreground"),
						children: formatAmount(sum, currency)
					})]
				}, person.id);
			})
		})]
	});
}
function currencyForChart(filter) {
	return filter === "all" ? "UZS" : filter;
}
function CategoryPanel() {
	const transactions = useLedgerStore((s) => s.transactions);
	const month = useLedgerStore((s) => s.month);
	const currencyFilter = useLedgerStore((s) => s.currencyFilter);
	const monthRows = transactions.filter((t) => inMonth(t.createdAt, month));
	const chartCurrency = currencyForChart(currencyFilter);
	const top = categorySpend(monthRows, chartCurrency).slice(0, 6);
	const peak = top[0]?.total ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl bg-card p-5 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-baseline justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-medium tracking-widest text-muted-foreground uppercase",
				children: "Categories"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [chartCurrency, " spend"]
			})]
		}), top.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "No expenses to group yet"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: top.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-sm",
					children: categoryLabel(row.id)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 text-sm whitespace-nowrap tabular text-muted-foreground",
					children: formatAbs(row.total, chartCurrency)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1 overflow-hidden rounded-full bg-secondary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full bg-primary/65",
					style: { width: `${peak ? row.total / peak * 100 : 0}%` }
				})
			})] }, row.id))
		})]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
			outline: "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
			destructive: "bg-destructive text-primary-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var DropdownMenu = Root2$1;
var DropdownMenuTrigger = Trigger;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	sideOffset,
	className: cn("z-50 min-w-44 overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground shadow-[var(--shadow-border)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2$1.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none focus:bg-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-40", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-border", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-11 w-full resize-none rounded-xl bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props,
		suppressHydrationWarning: true
	});
});
Textarea.displayName = "Textarea";
var EXAMPLES = [
	"Kartoshka 3kg 15 000",
	"Taxi 25$",
	"Doniyor kirim 2 000 000",
	"1 000 eur"
];
function Composer({ onHelp, className }) {
	const people = useLedgerStore((s) => s.people);
	const activePersonId = useLedgerStore((s) => s.activePersonId);
	const setActivePerson = useLedgerStore((s) => s.setActivePerson);
	const logText = useLedgerStore((s) => s.logText);
	const undo = useLedgerStore((s) => s.undo);
	const [value, setValue] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const ref = (0, import_react.useRef)(null);
	const parsed = (0, import_react.useMemo)(() => parseTransactionInputs(value), [value]);
	const intentWithoutAmount = parsed.length === 0 && value.trim().length > 0 && hasFinancialIntent(value);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "0px";
		el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
	}, [value]);
	function submit() {
		const trimmed = value.trim();
		if (!trimmed) return;
		if (trimmed.startsWith("/")) {
			handleCommand(trimmed);
			return;
		}
		const rows = logText(trimmed);
		if (rows.length === 0) {
			setError(intentWithoutAmount || hasFinancialIntent(trimmed) ? "Could not detect an amount. Include a price, like Taxi 25$." : "Need a number — the last number is the amount.");
			return;
		}
		setError(null);
		setValue("");
		const first = rows[0];
		toast(rows.length === 1 ? `Logged ${formatWithCode(first.amount, first.currency)}` : `Logged ${rows.length} lines`);
	}
	function handleCommand(raw) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("w-full", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl bg-card p-2 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					ref,
					value,
					rows: 1,
					onChange: (e) => {
						setValue(e.target.value);
						setError(null);
					},
					onKeyDown: (e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							submit();
						}
					},
					placeholder: "Type like a message — Kartoshka 3kg 15 000",
					className: "min-h-12 px-3 py-3 text-base md:text-sm",
					"aria-label": "Log a transaction"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 px-1 pb-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "gap-1.5 pl-2 pr-2.5 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "max-w-24 truncate",
									children: person?.name ?? "You"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
							align: "start",
							children: people.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onSelect: () => setActivePerson(p.id),
								className: cn(p.id === activePersonId && "bg-secondary"),
								children: p.name
							}, p.id))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": "Help",
							onClick: onHelp,
							className: "text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": "Undo last",
							onClick: () => {
								const batch = undo();
								toast(batch ? "Undone" : "Nothing to undo");
							},
							className: "text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-2",
							children: [parsed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "hidden max-w-56 truncate text-xs text-muted-foreground sm:block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("tabular font-medium", parsed[0].amount >= 0 ? "text-income" : "text-expense"),
									children: formatWithCode(parsed[0].amount, parsed[0].currency)
								}), parsed.length > 1 ? ` · +${parsed.length - 1}` : ` · ${parsed[0].note}`]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon-sm",
								"aria-label": "Log",
								onClick: submit,
								disabled: !value.trim(),
								className: "rounded-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" })
							})]
						})
					]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 px-3 text-xs text-expense",
				role: "alert",
				children: error
			}),
			intentWithoutAmount && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 px-3 text-xs text-muted-foreground",
				children: "Include a price (e.g. Taxi 25$ or Kartoshka 15 000)."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				children: EXAMPLES.map((example) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setValue(example);
						setError(null);
						ref.current?.focus();
					},
					className: "shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
					children: example
				}, example))
			})
		]
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-border)] duration-[var(--motion-fast)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-4 right-4 rounded-lg p-2 text-muted-foreground transition-opacity hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl tracking-tight text-foreground", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
var RULES = [
	{
		sample: "Kartoshka 3kg 15 000",
		result: "Expense · 15 000 UZS"
	},
	{
		sample: "Doniyor kirim 2 000 000",
		result: "Income · 2 000 000 UZS"
	},
	{
		sample: "Taxi 25$",
		result: "Expense · 25 USD"
	},
	{
		sample: "1 000 eur",
		result: "Expense · 1 000 EUR"
	},
	{
		sample: "+1000 usd",
		result: "Income · 1 000 USD"
	}
];
function HelpDialog({ open, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (value) => !value && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Write it like a chat" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The last number is the amount. Default currency is UZS. Currencies stay separate — no conversion." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: RULES.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col gap-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-sm",
						children: row.sample
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: row.result
					})]
				}, row.sample))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Start with + or include ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: "kirim"
					}),
					" for income. Multiple lines log together. Commands: /undo, /help."
				]
			})
		] })
	});
}
function buildDays(monthIso, currency, txs) {
	const { start, end } = monthBounds(monthIso);
	const days = Math.round((end.getTime() - start.getTime()) / 864e5);
	const points = Array.from({ length: days }, (_, i) => ({
		label: String(i + 1),
		day: i + 1,
		expense: 0,
		income: 0
	}));
	for (const tx of txs) {
		if (!inMonth(tx.createdAt, monthIso)) continue;
		if (tx.currency !== currency) continue;
		const point = points[new Date(tx.createdAt).getDate() - 1];
		if (!point) continue;
		if (tx.amount < 0) point.expense += Math.abs(tx.amount);
		else point.income += tx.amount;
	}
	return points;
}
function MonthChart() {
	const transactions = useLedgerStore((s) => s.transactions);
	const month = useLedgerStore((s) => s.month);
	const currency = currencyForChart(useLedgerStore((s) => s.currencyFilter));
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const data = (0, import_react.useMemo)(() => buildDays(month, currency, transactions), [
		month,
		currency,
		transactions
	]);
	const hasBars = data.some((d) => d.expense > 0 || d.income > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl bg-card p-5 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-baseline justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase",
				children: ["Daily ", currency]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Spend vs in"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-44",
			children: !mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full rounded-2xl bg-secondary/60" }) : !hasBars ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-center justify-center text-sm text-muted-foreground",
				children: "No movement this month"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
					data,
					barGap: 1,
					barCategoryGap: "18%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "label",
							tickLine: false,
							axisLine: false,
							interval: 4,
							tick: {
								fill: "var(--color-muted-foreground)",
								fontSize: 11
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							cursor: { fill: "var(--color-secondary)" },
							content: ({ active, payload, label }) => {
								if (!active || !payload?.length) return null;
								const point = payload[0]?.payload;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-popover px-3 py-2 text-xs shadow-[var(--shadow-border)]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mb-1 text-muted-foreground",
											children: ["Day ", label]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-expense tabular",
											children: [
												"−",
												formatAbs(point.expense, currency),
												" ",
												currency
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-income tabular",
											children: [
												"+",
												formatAbs(point.income, currency),
												" ",
												currency
											]
										})
									]
								});
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "expense",
							fill: "var(--color-expense)",
							radius: [
								3,
								3,
								0,
								0
							],
							maxBarSize: 10
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "income",
							fill: "var(--color-income)",
							radius: [
								3,
								3,
								0,
								0
							],
							maxBarSize: 10
						})
					]
				})
			})
		})]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)] placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props,
		suppressHydrationWarning: true
	});
});
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-xs font-medium tracking-wide text-muted-foreground", className),
	...props
}));
Label.displayName = Root.displayName;
var Sheet = Dialog$1;
var SheetPortal = DialogPortal$1;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay$1.displayName;
var sheetVariants = cva("fixed z-50 flex flex-col gap-4 bg-card p-6 shadow-[var(--shadow-border)] transition ease-[var(--ease-out)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-[var(--motion-medium)] data-[state=open]:duration-[var(--motion-slow)]", {
	variants: { side: {
		right: "inset-y-0 right-0 h-full w-full sm:max-w-md data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
		bottom: "inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-4 right-4 rounded-lg p-2 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
SheetContent.displayName = DialogContent$1.displayName;
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 pr-8", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl tracking-tight", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function SettingsPanel({ open, onClose }) {
	const people = useLedgerStore((s) => s.people);
	const budgets = useLedgerStore((s) => s.budgets);
	const addPerson = useLedgerStore((s) => s.addPerson);
	const renamePerson = useLedgerStore((s) => s.renamePerson);
	const removePerson = useLedgerStore((s) => s.removePerson);
	const setBudget = useLedgerStore((s) => s.setBudget);
	const startFresh = useLedgerStore((s) => s.startFresh);
	const restoreSample = useLedgerStore((s) => s.restoreSample);
	const [newName, setNewName] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange: (value) => !value && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Household" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "People, monthly budgets, and the sample ledger." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase",
								children: "People"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2",
								children: people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: person.name,
										onChange: (e) => renamePerson(person.id, e.target.value),
										"aria-label": `${person.name} name`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										disabled: people.length <= 1,
										onClick: () => removePerson(person.id),
										children: "Remove"
									})]
								}, person.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "flex gap-2",
								onSubmit: (e) => {
									e.preventDefault();
									addPerson(newName);
									setNewName("");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: newName,
									onChange: (e) => setNewName(e.target.value),
									placeholder: "Add a person"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "secondary",
									children: "Add"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase",
								children: "Monthly budgets"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Compared against this month’s expenses. Leave empty for no cap."
							}),
							CURRENCIES.map((currency) => {
								const current = budgets.find((b) => b.currency === currency)?.monthlyLimit ?? 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: `budget-${currency}`,
										children: [currency, current > 0 ? ` · ${formatAbs(current, currency)}` : ""]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: `budget-${currency}`,
										inputMode: "decimal",
										defaultValue: current || "",
										placeholder: "0",
										className: "tabular",
										onBlur: (e) => {
											const n = Number(e.target.value.replace(/\s/g, "").replace(",", "."));
											setBudget(currency, Number.isFinite(n) ? n : 0);
										}
									})]
								}, currency);
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase",
								children: "Data"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Everything stays on this device. Clearing the sample starts a blank household."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => {
										startFresh();
										onClose();
										toast("Blank ledger");
									},
									children: "Start fresh"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => {
										restoreSample();
										onClose();
										toast("Sample household restored");
									},
									children: "Restore sample"
								})]
							})
						]
					})
				]
			})]
		})
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-secondary text-muted-foreground",
		income: "bg-income/15 text-income",
		expense: "bg-expense/15 text-expense",
		outline: "shadow-[var(--shadow-border)] text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function dayLabel(iso) {
	const date = parseISO(iso);
	if (isToday(date)) return "Today";
	if (isYesterday(date)) return "Yesterday";
	return format(date, "EEE d MMM");
}
function TransactionList({ onSelect }) {
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
	const groups = [];
	for (const row of rows) {
		const label = dayLabel(row.createdAt);
		const last = groups[groups.length - 1];
		if (last && last.label === label) last.items.push(row);
		else groups.push({
			label,
			items: [row]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl bg-card p-5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-medium tracking-widest text-muted-foreground uppercase",
					children: "Activity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						"all",
						"expense",
						"income"
					].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTypeFilter(key),
						className: cn("h-11 rounded-full px-3.5 text-xs font-medium capitalize transition-colors", typeFilter === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"),
						children: key === "all" ? "All" : key
					}, key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: search,
					onChange: (e) => setSearch(e.target.value),
					placeholder: "Search notes, people",
					className: "pl-9",
					"aria-label": "Search transactions"
				})]
			}),
			groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Nothing in this month. Type a line above to log one."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border",
				children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-3 first:pt-0 last:pb-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase",
						children: group.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: group.items.map((tx) => {
						const person = people.find((p) => p.id === tx.personId)?.name ?? "—";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelect(tx),
							className: "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 shrink-0 rounded-full", tx.amount >= 0 ? "bg-income" : "bg-expense") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm",
										children: tx.note
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-0.5 flex items-center gap-2 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: person
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "default",
											className: "px-2 py-0",
											children: categoryLabel(tx.category)
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("shrink-0 text-right text-sm font-medium whitespace-nowrap tabular", tx.amount >= 0 ? "text-income" : "text-foreground"),
									children: formatWithCode(tx.amount, tx.currency)
								})
							]
						}) }, tx.id);
					}) })]
				}, group.label))
			})
		]
	});
}
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-border)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
		className: cn("font-display text-xl tracking-tight", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
		className: cn(buttonVariants(), className),
		...props
	});
}
function AlertDialogCancel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
		className: cn(buttonVariants({ variant: "outline" }), className),
		...props
	});
}
function TxEditor({ tx, onClose }) {
	const people = useLedgerStore((s) => s.people);
	const updateTransaction = useLedgerStore((s) => s.updateTransaction);
	const deleteTransaction = useLedgerStore((s) => s.deleteTransaction);
	const [note, setNote] = (0, import_react.useState)("");
	const [absAmount, setAbsAmount] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("expense");
	const [currency, setCurrency] = (0, import_react.useState)(CURRENCIES[0]);
	const [category, setCategory] = (0, import_react.useState)(CATEGORIES[0].id);
	const [personId, setPersonId] = (0, import_react.useState)("");
	const [when, setWhen] = (0, import_react.useState)("");
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
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
		const iso = when ? (/* @__PURE__ */ new Date(`${when}T12:00:00`)).toISOString() : current.createdAt;
		updateTransaction(current.id, {
			note: note.trim() || current.note,
			amount: type === "income" ? n : -n,
			type,
			currency,
			category,
			personId,
			createdAt: iso
		});
		toast("Updated");
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: Boolean(current),
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Edit entry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Adjust the line, then save." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "note",
							children: "Note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "note",
							value: note,
							onChange: (e) => setNote(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "amount",
								children: "Amount"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "amount",
								inputMode: "decimal",
								value: absAmount,
								onChange: (e) => setAbsAmount(e.target.value),
								className: "tabular"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "when",
								children: "When"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "when",
								type: "date",
								value: when,
								onChange: (e) => setWhen(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: ["expense", "income"].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setType(key),
							className: cn("h-11 flex-1 rounded-xl text-sm capitalize", type === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
							children: key
						}, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Currency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCurrency(c),
								className: cn("h-11 flex-1 rounded-xl text-sm", currency === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
								children: c
							}, c))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "category",
							children: "Category"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "category",
							value: category,
							onChange: (e) => setCategory(e.target.value),
							className: "h-11 w-full rounded-lg bg-secondary px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
							children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c.id,
								children: c.label
							}, c.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "person",
							children: "Person"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "person",
							value: personId,
							onChange: (e) => setPersonId(e.target.value),
							className: "h-11 w-full rounded-lg bg-secondary px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
							children: people.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.name
							}, p.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: save,
							children: "Save"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setConfirmDelete(true),
							children: "Delete"
						})]
					})
				]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: confirmDelete,
		onOpenChange: setConfirmDelete,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this line?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [current?.note ?? "This entry", " will be removed from the ledger."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			className: "bg-destructive text-primary-foreground",
			onClick: () => {
				if (!current) return;
				deleteTransaction(current.id);
				setConfirmDelete(false);
				onClose();
				toast("Deleted");
			},
			children: "Delete"
		})] })] })
	})] });
}
function exportCsv() {
	const { transactions, people } = useLedgerStore.getState();
	const header = [
		"date",
		"person",
		"type",
		"category",
		"note",
		"amount",
		"currency"
	];
	const lines = transactions.map((t) => {
		const person = people.find((p) => p.id === t.personId)?.name ?? "";
		const note = `"${t.note.replaceAll("\"", "\"\"")}"`;
		return [
			t.createdAt,
			person,
			t.type,
			t.category,
			note,
			t.amount,
			t.currency
		].join(",");
	});
	const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "hisob.csv";
	a.click();
	URL.revokeObjectURL(url);
	toast("Exported CSV");
}
function LedgerApp() {
	const isSample = useLedgerStore((s) => s.isSample);
	const month = useLedgerStore((s) => s.month);
	const setMonth = useLedgerStore((s) => s.setMonth);
	const startFresh = useLedgerStore((s) => s.startFresh);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [helpOpen, setHelpOpen] = (0, import_react.useState)(false);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		bootstrapLedger();
	}, []);
	const monthDate = /* @__PURE__ */ new Date(`${month}T00:00:00`);
	const monthLabel = format(monthDate, "MMMM yyyy");
	const canGoForward = addMonths(monthDate, 1) <= /* @__PURE__ */ new Date();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-6 pb-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mr-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-widest text-muted-foreground uppercase",
									children: "Household ledger"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-4xl leading-none tracking-tight",
									children: "Hisob"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center rounded-full bg-card p-1 shadow-[var(--shadow-border)]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": "Previous month",
										onClick: () => setMonth(shiftMonth(month, -1)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-32 px-2 text-center text-sm",
										children: monthLabel
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": "Next month",
										disabled: !canGoForward,
										onClick: () => setMonth(shiftMonth(month, 1)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Export CSV",
								onClick: exportCsv,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Settings",
								onClick: () => setSettingsOpen(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" })
							})
						]
					}),
					isSample && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)] sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "flex-1 text-sm text-muted-foreground",
							children: "Sample household — log a line of your own, or start a blank ledger."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: startFresh,
							children: "Start fresh"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, { onHelp: () => setHelpOpen(true) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BalanceCards, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleStrip, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthChart, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryPanel, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionList, { onSelect: setEditing })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxEditor, {
				tx: editing,
				onClose: () => setEditing(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {
				open: settingsOpen,
				onClose: () => setSettingsOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpDialog, {
				open: helpOpen,
				onClose: () => setHelpOpen(false)
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerApp, {});
}
//#endregion
export { Home as component };
