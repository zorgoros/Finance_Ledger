# Money Ledger

A local finance dashboard for tracking money you gave to people and money you received from them.

## Use it

Open `index.html` in a browser, or run a small local server from this folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## What it does

- Saves records locally in the browser using IndexedDB.
- Tracks name, amount, currency, direction, date, and optional note.
- Supports separate international and Iranian date fields.
- Supports Dollar and Iranian Toman transactions.
- Keeps Dollar and Toman balances separate in totals and per-person balances.
- Stores a Dollar-to-Toman rate only for the manual converter.
- Uses received-money records as repayments or money you owe, depending on the balance.
- Keeps a local IndexedDB audit log for created, updated, deleted, imported, and cleared records.
- Calculates who owes you and who you owe.
- Groups balances by person.
- Lets you click a person to open a focused workspace for that person.
- Supports quick debt, partial repayment, and full Dollar/Toman settlement from the selected person workspace.
- Supports search by name or note.
- Supports filtering by balance status.
- Lets you edit, delete, or clear records.
- Lets you export and import JSON backups.
- Shows totals in both Dollar and Toman without converting saved balances.

Your data stays on the same browser and device unless you clear browser storage.
Use **Export JSON** regularly if you need a backup or want to move data to another browser.

## Smoke test

After installing Node dependencies and Playwright browsers, run:

```bash
npm install
npx playwright install chromium
npm run test:smoke
```
