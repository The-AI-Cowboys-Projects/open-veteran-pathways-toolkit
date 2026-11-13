import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 120000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:8765",
  },
  webServer: {
    command: "python3 scripts/serve.py --port 8765 --bind 127.0.0.1",
    url: "http://127.0.0.1:8765/",
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /mobile\.spec\.js/,
      use: { browserName: "chromium", viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile",
      testMatch: /mobile\.spec\.js/,
      use: {
        browserName: "chromium",
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
