import { defineConfig } from '@playwright/test'

const port = 3838
const exportEnvPrefix = [
  process.env.EXPO_NO_DOTENV
    ? `EXPO_NO_DOTENV=${process.env.EXPO_NO_DOTENV}`
    : null,
  process.env.EXPO_PUBLIC_USE_MOCK_DATA
    ? `EXPO_PUBLIC_USE_MOCK_DATA=${process.env.EXPO_PUBLIC_USE_MOCK_DATA}`
    : null,
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
    command: `${exportEnvPrefix ? `${exportEnvPrefix} ` : ''}npx expo export --platform web && npx serve -s dist -l tcp://127.0.0.1:${port}`,
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
