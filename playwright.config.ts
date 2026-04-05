import { defineConfig } from '@playwright/test'

const port = 3838
const expoNoDotenv = process.env.EXPO_NO_DOTENV ?? '1'
const useMockData = process.env.EXPO_PUBLIC_USE_MOCK_DATA ?? 'true'
const exportEnvPrefix = [
  `EXPO_NO_DOTENV=${expoNoDotenv}`,
  `EXPO_PUBLIC_USE_MOCK_DATA=${useMockData}`,
]
  .filter(Boolean)
  .join(' ')

export default defineConfig({
  testDir: 'tests',
  reporter: [['list']],

  use: {
    baseURL: `http://localhost:${port}`,
  },

  webServer: {
    // Keep the web export aligned with the same shell env that launched Playwright.
    // Default to mock mode so the full suite exercises deterministic route data without
    // depending on whatever happens to be present in a local .env file.
    // Clear Metro's cache so EXPO_PUBLIC_* test env changes cannot reuse a stale web bundle.
    command: `${exportEnvPrefix ? `${exportEnvPrefix} ` : ''}npx expo export --platform web --clear && npx serve -s dist -l tcp://127.0.0.1:${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },

  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  maxFailures: 1,
  timeout: 30_000,
})
