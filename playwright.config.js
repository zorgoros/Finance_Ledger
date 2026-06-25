import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:8080",
  },
  webServer: {
    command: "mkdir -p test-results && rm -f test-results/smoke.sqlite test-results/smoke.sqlite-shm test-results/smoke.sqlite-wal && MONEY_LEDGER_DB_PATH=test-results/smoke.sqlite node apps/api/index.js",
    url: "http://127.0.0.1:8080",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
