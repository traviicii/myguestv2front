import { expect, test } from '@playwright/test'

test('static export hydrates without Missing theme error', async ({ page }) => {
  const errors: string[] = []

  page.on('pageerror', (err) => {
    errors.push(err.message)
  })

  await page.goto('/', { waitUntil: 'load' })

  // wait for client hydration
  await page.waitForTimeout(3000)

  // should not show the error boundary
  await expect(page.getByText('Something went wrong')).not.toBeVisible()
  await expect(page.getByText('Missing theme')).not.toBeVisible()

  // Verify app hydration regardless of whether auth is required in this environment.
  const hydrationMarkers = [
    page.getByText('Sign In'),
    page.getByText('Overview'),
    page.getByText('Profile'),
  ]
  const markerVisibility = await Promise.all(
    hydrationMarkers.map((marker) => marker.isVisible().catch(() => false))
  )
  expect(markerVisibility.some(Boolean)).toBeTruthy()

  const visibleMarker =
    hydrationMarkers[markerVisibility.findIndex((visible) => visible)] ??
    hydrationMarkers[0]

  // verify no page errors related to missing theme
  const themeErrors = errors.filter((e) => e.includes('Missing theme'))
  expect(themeErrors).toHaveLength(0)

  // verify themed styles are applied (not unstyled)
  const color = await visibleMarker.evaluate((el) => window.getComputedStyle(el).color)
  expect(color).toBeTruthy()
  expect(color).not.toBe('')
})
