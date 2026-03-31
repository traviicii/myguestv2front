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

function linePattern(prefix: string, label: string) {
  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return new RegExp(`${escapeRegExp(prefix)}.*${escapeRegExp(label)}`, 'i')
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

  test('gallery selections update the preview immediately but only apply after confirmation', async ({
    page,
  }) => {
    await openThemePreferencesWithTheme(page, 'light')

    await expect(page.getByText(linePattern('Live', 'Citrus Signal · Light')).first()).toBeVisible()
    await expect(page.getByTestId('theme-preview-stage')).toBeVisible()
    await expect(page.getByTestId('theme-mode-toggle-inline')).toBeVisible()
    await expect(page.getByTestId('theme-preview-stage').getByText(/save appointment/i)).toBeVisible()
    await expect(
      page
        .getByTestId('theme-preset-rail')
        .getByText(/save appointment|formula \/ notes|price|date|services|avery stone/i)
    ).toHaveCount(0)

    await page.getByTestId('theme-mode-toggle-inline').click()
    await expect(page.getByText(linePattern('Live', 'Citrus Signal · Light')).first()).toBeVisible()
    await expect(
      page.getByText(linePattern('Preview', 'Afterglow Signal · Dark')).first()
    ).toBeVisible()

    await page.getByTestId('theme-preset-neon-alloy-dark').click()
    await expect(
      page.getByText(linePattern('Preview', 'Neon Alloy · Dark')).first()
    ).toBeVisible()

    await page.getByTestId('theme-customize-button').click()
    await expect(page.getByTestId('theme-customize-sheet')).toBeVisible()
    await page.getByTestId('theme-customize-aesthetic-glass').click()
    await page.getByTestId('theme-customize-palette-alloy').click()
    await expect(
      page.getByText(linePattern('Preview', 'Custom · Glass · Alloy · Dark')).first()
    ).toBeVisible()
    await expect(page.getByTestId('theme-preset-custom')).toBeVisible()
    await page.getByRole('button', { name: 'Done' }).click()

    await page.getByRole('button', { name: 'Reset Draft' }).click()
    await expect(page.getByText(linePattern('Live', 'Citrus Signal · Light')).first()).toBeVisible()
    await expect(page.getByText(/previewing changes/i)).toHaveCount(0)
    await expect(page.getByTestId('theme-customize-sheet')).toHaveCount(0)

    await page.getByTestId('theme-mode-toggle-inline').click()
    await page.getByTestId('theme-preset-neon-alloy-dark').click()
    await page.getByRole('button', { name: 'Apply Theme' }).click()

    await expect(page.getByText(linePattern('Theme applied', 'Neon Alloy · Dark')).first()).toBeVisible()
    await expect(page.getByText(linePattern('Live', 'Neon Alloy · Dark')).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Applied' })).toBeVisible()
    await expect(page.getByText(/previewing changes/i)).toHaveCount(0)
  })
})
