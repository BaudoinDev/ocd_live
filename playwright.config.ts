import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  reporter: "list",
  outputDir: "test-results",
  use: {
    // localhost, not 127.0.0.1: Next.js blocks dev resources from another origin, so an already running `npm run dev` would never hydrate.
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `${process.platform === "win32" ? "npm.cmd" : "npm"} run dev`,
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
