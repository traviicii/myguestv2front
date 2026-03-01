import { expect, test } from '@playwright/test'

const palettes = ['signal', 'alloy', 'pearl'] as const
const aesthetics = ['modern', 'cyberpunk', 'glass'] as const
const modes = ['light', 'dark'] as const

const injectThemePrefs = (
  palette: (typeof palettes)[number],
  aesthetic: (typeof aesthetics)[number],
  mode: (typeof modes)[number]
) => {
  return {
    state: {
      palette,
      aesthetic,
      mode,
    },
    version: 0,
  }
}

test.describe('Theme Matrix Visual Regression', () => {
  for (const palette of palettes) {
    for (const aesthetic of aesthetics) {
      for (const mode of modes) {
        const snapshotName = `theme-matrix-${palette}-${aesthetic}-${mode}.png`

        test(`captures ${palette}/${aesthetic}/${mode}`, async ({ page }) => {
          await page.addInitScript((payload) => {
            localStorage.setItem('theme-prefs', JSON.stringify(payload))
          }, injectThemePrefs(palette, aesthetic, mode))

          await page.goto('/', { waitUntil: 'networkidle' })

          // Give web hydration and persisted theme application a deterministic settle window.
          await page.waitForTimeout(400)

          const authHeading = page.getByText('Sign In')
          const tabHeading = page.getByText('Overview')
          const profileHeading = page.getByText('Profile')

          if (await authHeading.isVisible().catch(() => false)) {
            await expect(authHeading).toBeVisible()
          } else if (await tabHeading.isVisible().catch(() => false)) {
            await expect(tabHeading).toBeVisible()
          } else {
            await expect(profileHeading).toBeVisible()
          }

          await expect(page).toHaveScreenshot(snapshotName, {
            fullPage: true,
            animations: 'disabled',
            maxDiffPixelRatio: 0.02,
          })
        })
      }
    }
  }
})
