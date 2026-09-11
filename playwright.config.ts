import { defineConfig, devices } from "@playwright/test";

// Dev servers in this workspace get their port from ./scripts/agent-dev.mjs,
// which exports PORT. When the runner starts its own server it uses a port
// outside the allocator's range so it can never take a leased one.
const port = Number(process.env.PORT || 4321);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  reporter: "line",
  // The Open Peeps drawings are a megabyte of path data, so the dev server's
  // first compile of a page is slow even though the built site is fast.
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `bunx vite dev --host 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
