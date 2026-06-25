# Money Ledger

A local finance dashboard for tracking money you gave to people and money you received from them.

## Open it

On macOS, double-click `Money Ledger.app` in the project root.
The dashboard opens automatically in your browser.

## Close it

On macOS, double-click `Stop Money Ledger.app` to stop the background server.
Closing the browser tab only closes the view; it does not stop the session.

## Terminal fallback

If you prefer Terminal:

```bash
npm install
npm run launch
npm run stop
```

Optional macOS fallbacks:

```text
Open Money Ledger.command
Stop Money Ledger.command
```

## Repo layout

- `apps/web/`: frontend files
- `apps/api/`: SQLite server and API routes
- `local-data/`: local database files, ignored by Git

## What it does

- Saves records locally in `local-data/money-ledger.sqlite` using SQLite.
- Tracks name, amount, currency, direction, date, and optional note.
- Supports Gregorian and Persian date picker modes while storing both international and Iranian date fields.
- Supports Dollar and Iranian Toman transactions.
- Keeps Dollar and Toman balances separate in totals and per-person balances.
- Stores a Dollar-to-Toman rate only for the manual converter.
- Uses received-money records as repayments or money you owe, depending on the balance.
- Keeps a local SQLite audit log for created, updated, deleted, imported, and cleared records.
- Calculates who owes you and who you owe.
- Groups balances by person.
- Lets you click a person to open a focused workspace for that person.
- Supports quick debt, partial repayment, and full Dollar/Toman settlement from the selected person workspace.
- Supports English/Persian UI switching with automatic page direction.
- Supports a persistent light/dark theme toggle.
- Supports search by name or note.
- Supports filtering by balance status.
- Lets you edit, delete, or clear records.
- Lets you export and import JSON backups.
- Shows totals in both Dollar and Toman without converting saved balances.

Your data stays in the local SQLite file unless you delete `local-data/money-ledger.sqlite`.
Use **Export JSON** regularly if you need a backup or want to move data to another install.

The database file is ignored by Git and should not be pushed:

```text
local-data/money-ledger.sqlite
```

## Import format

Import replaces every current record after confirmation. The safest file is one created by **Export** from this dashboard.

Accepted JSON shape:

```json
{
  "app": "money-ledger",
  "version": 1,
  "usdToTomanRate": "60000",
  "transactions": [
    {
      "id": "optional-stable-id-1",
      "name": "Person name",
      "amount": 500000,
      "currency": "TOMAN",
      "direction": "theyOwe",
      "date": "2026-06-20",
      "iranianDate": "",
      "note": "Optional note",
      "createdAt": 1782000000000
    }
  ]
}
```

`currency` must be `USD` or `TOMAN`. `direction` must be `theyOwe` or `iOwe`. Toman amounts must be whole numbers.

## Smoke test

After installing Node dependencies and Playwright browsers, run:

```bash
npm install
npx playwright install chromium
npm run test:smoke
```
