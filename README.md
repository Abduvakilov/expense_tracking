# Telegram expense tracking bot

Cloudflare Worker + D1 bot that logs group (or private) messages as signed transactions. Currencies **UZS**, **USD**, and **EUR** are stored separately — there is no FX conversion.

## Setup

1. Create a bot with [@BotFather](https://t.me/BotFather). Copy the token.
2. For groups, run `/setprivacy` → **Disable** so the bot sees normal messages (not only `/commands`).
3. Add the bot to the group.

```bash
npm install
npx wrangler login
npx wrangler d1 create expense-tracking
```

Paste the printed `database_id` into `wrangler.toml`. Then:

```bash
npx wrangler d1 migrations apply expense-tracking --remote
npx wrangler secret put BOT_TOKEN
npx wrangler secret put WEBHOOK_SECRET
npm run deploy
```

Point Telegram at the worker (use the same secret):

```bash
curl "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -d "url=https://expense-tracking-bot.<your-subdomain>.workers.dev/" \
  -d "secret_token=$WEBHOOK_SECRET"
```

## Local

```bash
cp .dev.vars.example .dev.vars
npx wrangler d1 migrations apply expense-tracking --local
npm test
npm run dev
```

`POST /` is the Telegram webhook and always returns `{ "status": "ok" }` so Telegram does not retry. Replies are sent with `fetch` to `https://api.telegram.org/bot<token>/sendMessage`.

## Usage

| Message | Result |
| --- | --- |
| `Kartoshka 3kg 15 000` | −15000 UZS, note Kartoshka 3kg |
| `Doniyor kirim 2 000 000` | +2000000 UZS, note Doniyor |
| `Taxi 25$` | −25 USD |
| `1 000 eur` | −1000 EUR, note Expense |
| `/balance` | Per-user + group totals by currency |
| `/undo` | Deletes your latest row in this chat |
| `/start` `/help` | Examples and rules |

Chat without numbers is ignored. Words like `kirim` with no amount get a warning instead of spam.
