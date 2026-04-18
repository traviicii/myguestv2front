import { expect, test, type Page } from '@playwright/test'

const modes = ['light', 'dark'] as const

const injectThemePrefs = (mode: (typeof modes)[number]) => ({
  state: {
    aesthetic: 'modern',
    mode,
    palette: 'signal',
  },
  version: 0,
})

async function openThemePreferencesWithTheme(
  page: Page,
  mode: (typeof modes)[number]
) {
  await page.setViewportSize({ width: 430, height: 1500 })
  await page.addInitScript((payload: ReturnType<typeof injectThemePrefs>) => {
    localStorage.setItem('theme-prefs', JSON.stringify(payload))
  }, injectThemePrefs(mode))

  await page.goto('/theme-preferences', { waitUntil: 'networkidle' })
  await expect(page.getByText(/theme preferences/i).first()).toBeVisible()
  await page.waitForTimeout(400)
}

test.describe('Style Studio Preview', () => {
  for (const mode of modes) {
    test(`matches theme gallery in ${mode}`, async ({ page }) => {
      await openThemePreferencesWithTheme(page, mode)

      await expect(page.getByTestId('theme-preferences-screen')).toHaveScreenshot(
        `theme-preferences-gallery-${mode}.png`,
        {
          animations: 'disabled',
          maxDiffPixelRatio: 0.02,
        }
      )
    })
  }

  test('gallery selections apply immediately and customize keeps the theme live', async ({
    page,
  }) => {
    await openThemePreferencesWithTheme(page, 'light')

    await expect(page.getByText(/^current theme$/i)).toBeVisible()
    await expect(page.getByText(/modern light signal/i).first()).toBeVisible()
    await expect(page.getByTestId('theme-preview-stage')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Apply Theme' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Reset Draft' })).toHaveCount(0)
    await expect(page.getByTestId('theme-preset-gallery')).toBeVisible()
    await expect(page.getByTestId('theme-preset-gallery').getByText(/pinned/i).first()).toBeVisible()
    await expect(
      page.getByTestId('theme-preset-citrus-signal-light-selected-marker')
    ).toBeVisible()
    await expect(page.getByTestId('theme-preset-citrus-signal-light-cta')).toHaveText(
      /^selected$/i
    )
    await expect(
      page.getByTestId('theme-preset-citrus-signal-light').getByText(/^Current$/i)
    ).toHaveCount(0)

    await page.getByTestId('theme-preset-neon-alloy-dark').click()
    await expect(page.getByText(/cyberpunk dark alloy/i).first()).toBeVisible()
    await expect(
      page.getByTestId('theme-preset-neon-alloy-dark-selected-marker')
    ).toBeVisible()
    await expect(page.getByTestId('theme-preset-neon-alloy-dark-cta')).toHaveText(
      /^selected$/i
    )

    await page.getByTestId('theme-customize-button').click()
    await expect(page.getByTestId('theme-customize-sheet')).toBeVisible()
    await page.getByTestId('theme-customize-aesthetic-glass').click()
    await page.getByTestId('theme-customize-palette-alloy').click()
    await expect(page.getByText(/custom · glass dark alloy/i).first()).toBeVisible()
    await expect(page.locator('[data-testid$="-selected-marker"]')).toHaveCount(0)
    await expect(page.locator('[data-testid$="-cta"]', { hasText: /^Selected$/i })).toHaveCount(0)
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByTestId('theme-customize-sheet')).toHaveCount(0)

    await page.getByTestId('theme-preset-afterglow-signal-dark').click()
    await expect(page.getByText(/modern dark signal/i).first()).toBeVisible()
    await expect(
      page.getByTestId('theme-preset-afterglow-signal-dark-selected-marker')
    ).toBeVisible()
    await expect(page.getByTestId('theme-preset-afterglow-signal-dark-cta')).toHaveText(
      /^selected$/i
    )
  })
})
