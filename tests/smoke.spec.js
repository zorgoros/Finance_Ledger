import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test("loads, edits records, exports, and imports a backup", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.locator("#page-title")).toContainText("Money Ledger");
  await expect(page.locator("#peopleCount")).toHaveText("0 people");

  await page.locator("#name").fill("Test Person");
  await page.locator("#amount").fill("20");
  await page.locator("#note").fill("Initial smoke record");
  await page.getByRole("button", { name: "Save record" }).click();
  await expect(page.locator("#recordsTable")).toContainText("Test Person");

  await page.locator(".person-card").filter({ hasText: "Test Person" }).click();
  await expect(page.locator("#selectedPersonTitle")).toHaveText("Test Person");
  await expect(page.locator("#name")).toHaveValue("Test Person");
  await page.locator("#quickCurrency").selectOption("TOMAN");
  await page.locator("#quickAmount").fill("1000");
  await page.locator("#quickDebtButton").click();
  await expect(page.locator("#recordsTable")).toContainText("Quick debt");

  await page.locator("#transactionCurrency").selectOption("TOMAN");
  await expect(page.locator("#amount")).toHaveAttribute("step", "1");

  await page.locator("#transactionCurrency").selectOption("USD");
  await page.locator("#name").fill("Another Person");
  await page.locator("#amount").fill("12.50");
  await page.locator("#note").fill("Smoke test record");
  await page.getByRole("button", { name: "Save record" }).click();
  await expect(page.locator("#recordsTable")).toContainText("Another Person");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportButton").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^money-ledger-backup-\d{4}-\d{2}-\d{2}\.json$/);

  const backupPath = testInfo.outputPath("backup.json");
  await writeFile(
    backupPath,
    JSON.stringify(
      {
        app: "money-ledger",
        version: 1,
        exportedAt: new Date().toISOString(),
        usdToTomanRate: "60000",
        transactions: [
          {
            id: "smoke-import-1",
            name: "Imported Person",
            amount: 500000,
            currency: "TOMAN",
            direction: "theyOwe",
            date: "2026-06-20",
            iranianDate: "",
            note: "Imported backup record",
            createdAt: 1782000000000,
          },
        ],
      },
      null,
      2,
    ),
  );

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#importFile").setInputFiles(backupPath);
  await expect(page.locator("#peopleCount")).toHaveText("1 person");
  await expect(page.locator("#recordsTable")).toContainText("Imported Person");
  await expect(page.locator("#ratePreview")).toContainText("60,000 T");
});
