import { defineConfig, devices } from "playwright/test"

const appPort = Number(process.env.E2E_PORT ?? "3000")

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: `http://localhost:${appPort}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${appPort}`,
    port: appPort,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
