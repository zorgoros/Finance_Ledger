import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:8080",
  },
  webServer: {
    command: "python3 -m http.server 8080",
    url: "http://127.0.0.1:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
