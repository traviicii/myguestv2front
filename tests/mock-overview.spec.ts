import { expect, test } from '@playwright/test'

test('mock mode renders overview data without requiring auth', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.getByText('Overview')).toBeVisible()
  await expect(page.getByText('Avery Stone').first()).toBeVisible()
  await expect(page.getByText('Revenue (YTD)')).toBeVisible()
})
