import { expect, test } from '@playwright/test'

test('onboarding route redirects existing mock accounts into overview', async ({ page }) => {
  await page.goto('/onboarding', { waitUntil: 'networkidle' })

  await expect(page).not.toHaveURL(/\/onboarding$/)
  await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
})
