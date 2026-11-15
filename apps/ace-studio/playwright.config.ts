/** @module playwright-config @remarks Browser E2E against a disposable mock backend. @internal */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 35_000,
  use: {
    baseURL: "http://127.0.0.1:4211",
    browserName: "chromium",
    trace: "retain-on-failure"
  },
  webServer: [
    {
      command: "node tests/mock-backend.mjs",
      url: "http://127.0.0.1:18081/health",
      reuseExistingServer: false,
      timeout: 15_000
    },
    {
      command: "npx ng serve --host 127.0.0.1 --port 4211",
      url: "http://127.0.0.1:4211",
      reuseExistingServer: false,
      timeout: 120_000
    }
  ]
});
