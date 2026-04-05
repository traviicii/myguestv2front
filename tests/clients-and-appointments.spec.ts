import { expect, test } from '@playwright/test'

test('client detail route renders actions, timeline, and color chart data in mock mode', async ({
  page,
}) => {
  await page.goto('/clients', { waitUntil: 'networkidle' })
  await page.getByText('Avery Stone', { exact: true }).first().click()
  await expect(page).toHaveURL(/\/client\/c-101$/)

  await expect(page.getByText('Avery Stone', { exact: true }).last()).toBeVisible()
  await expect(page.getByText('(212) 555-0101')).toBeVisible()
  await expect(page.getByText('Rebooking')).toBeVisible()
  await expect(page.getByText('Quick Actions')).toBeVisible()
  await expect(page.getByText('Client Timeline')).toBeVisible()
  await expect(page.getByText('Color chart updated')).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Full Chart' }).first()).toBeVisible()
})

test('client edit route loads existing client values in mock mode', async ({ page }) => {
  await page.goto('/clients', { waitUntil: 'networkidle' })
  await page.getByText('Avery Stone', { exact: true }).first().click()
  await page.getByRole('button', { name: 'Edit' }).click()
  await expect(page).toHaveURL(/\/client\/c-101\/edit$/)

  await expect(page.getByText('Edit Client')).toBeVisible()
  await expect(page.getByRole('textbox').first()).toHaveValue('Avery Stone')
  await expect(page.getByText('Client Type')).toBeVisible()
  await expect(page.getByText('Delete Client')).toBeVisible()
})

test('appointment detail route renders summary and navigation affordances in mock mode', async ({
  page,
}) => {
  await page.goto('/appointments', { waitUntil: 'networkidle' })

  await page
    .getByRole('link', { name: 'Cut & Color Avery Stone 03/07/2026 $265' })
    .click()

  await expect(page).toHaveURL(/\/appointment\/h-1001/)
  await expect(page.getByText('Cut & Color', { exact: true }).last()).toBeVisible()
  await expect(page.getByText('Price')).toBeVisible()
  await expect(page.getByText('$265').last()).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Client' })).toBeVisible()
})

test('quick log route lets you pick a client and prepares follow-up fields in mock mode', async ({
  page,
}) => {
  await page.goto('/quick-log', { waitUntil: 'networkidle' })

  await expect(page.getByText('Quick Log')).toBeVisible()
  await page.getByPlaceholder('Search clients').fill('Avery')
  await page.getByText('Avery Stone', { exact: true }).last().click()

  await expect(page.getByText('Choose a service')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Date (MM/DD/YYYY)' })).toBeVisible()
  await expect(page.getByPlaceholder('MM/DD/YYYY', { exact: true })).toBeVisible()
  await expect(page.getByPlaceholder('Add your follow-up message')).toBeVisible()
})

test('control route renders style, summary, and account controls in mock mode', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Control' }).click()
  await expect(page).toHaveURL(/\/profile$/)

  await expect(page.getByText(/^control center$/i)).toBeVisible()
  await expect(page.getByText(/^theme preferences$/i)).toBeVisible()
  await expect(page.getByText(/open theme picker/i)).toBeVisible()
  await expect(page.getByText(/^all controls$/i)).toBeVisible()
  await expect(page.getByText(/^clients & status$/i)).toBeVisible()
  await expect(page.getByText(/^overview & insights$/i)).toBeVisible()
  await expect(page.getByText(/^services & appointment logs$/i)).toBeVisible()
  await expect(page.getByText(/^account$/i)).toBeVisible()

  await page.getByRole('link', { name: 'Open Theme Picker' }).click()
  await expect(page).toHaveURL(/\/theme-preferences$/)
  await expect(page.getByText(/^live · /i)).toBeVisible()
  await expect(page.getByText(/^customize$/i)).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/profile$/)

  await page.getByText('Edit').last().click()
  await expect(page.getByRole('textbox', { name: /^name$/i })).toBeVisible()
  await expect(page.getByPlaceholder('(555) 555-5555')).toBeVisible()
})

test('color chart edit route renders grouped fields in mock mode', async ({ page }) => {
  await page.goto('/clients', { waitUntil: 'networkidle' })
  await page.getByText('Avery Stone', { exact: true }).first().click()
  await page.getByRole('link', { name: 'View Full Chart' }).first().click()
  await page.getByRole('link', { name: 'Edit' }).click()

  await expect(page).toHaveURL(/\/client\/c-101\/color-chart\/edit$/)
  await expect(page.getByText('EDIT COLOR CHART')).toBeVisible()
  await expect(page.getByText('Avery Stone', { exact: true }).last()).toBeVisible()
  await expect(page.getByText('Hair Profile').last()).toBeVisible()
  await expect(page.getByText('Level Planning').last()).toBeVisible()
  await expect(page.getByText('Tone Profile').last()).toBeVisible()
  await expect(page.getByText('Porosity').last()).toBeVisible()
  await expect(page.getByText('Eye Color').last()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
})

test('clients screen search and filters narrow results in mock mode', async ({ page }) => {
  await page.goto('/clients', { waitUntil: 'networkidle' })

  await expect(page.getByText('Client Index')).toBeVisible()

  const searchInput = page.getByPlaceholder('Search clients, tags, notes')
  await searchInput.fill('Marco')

  await expect(page.getByText('Marco Vale')).toBeVisible()
  await expect(page.getByText('Avery Stone')).toHaveCount(0)

  await page.getByText('Filters').click()
  await page.getByText('Inactive', { exact: true }).last().click()

  await expect(page.getByText('No clients match your search or filters.')).toBeVisible()

  await page.getByText('Clear filters').click()
  await expect(page.getByText('Marco Vale')).toBeVisible()
  await expect(searchInput).toHaveValue('')
})

test('appointment client picker route filters clients and opens a client log flow in mock mode', async ({
  page,
}) => {
  await page.goto('/appointments/new', { waitUntil: 'networkidle' })

  await expect(page).toHaveURL(/\/appointments\/new$/)
  await expect(page.getByPlaceholder('Search clients')).toBeVisible()
  await page.getByPlaceholder('Search clients').fill('Avery')
  await page
    .getByRole('link', { name: 'Avery Stone Cut & Color • Last visit 03/07/2026 Select' })
    .click()

  await expect(page).toHaveURL(/\/client\/c-101\/new-appointment$/)
  await expect(page.getByText('NEW APPOINTMENT LOG', { exact: true })).toBeVisible()
})

test('new appointment route opens pickers and lets you choose services in mock mode', async ({
  page,
}) => {
  await page.goto('/clients', { waitUntil: 'networkidle' })

  await page.getByText('New Appointment Log').first().click()

  await expect(page.getByText('NEW APPOINTMENT LOG', { exact: true })).toBeVisible()
  await expect(page.getByText('Avery Stone', { exact: true }).last()).toBeVisible()
  await expect(page.getByText(/^\d{2}\/\d{2}\/\d{4}$/).first()).toBeVisible()

  await page.getByText('Select services').click()
  await expect(page.getByText('Clear all').last()).toBeVisible()

  await page.getByText('Cut', { exact: true }).last().click()
  await page.getByText('NEW APPOINTMENT LOG', { exact: true }).click()

  await expect(page.getByText('Select services')).toHaveCount(0)
})

test('edit appointment route opens date picker and supports clearing selected services', async ({
  page,
}) => {
  await page.goto('/appointments', { waitUntil: 'networkidle' })

  await page
    .getByRole('link', { name: 'Cut & Color Avery Stone 03/07/2026 $265' })
    .click()
  await page.getByRole('button', { name: 'Edit' }).click()

  await expect(page.getByText('EDIT APPOINTMENT LOG', { exact: true })).toBeVisible()
  await expect(page.getByText('Avery Stone', { exact: true }).last()).toBeVisible()
  await expect(page.getByText('03/07/2026', { exact: true }).last()).toBeVisible()

  await page.getByText('Cut & Color +1').click()
  await expect(page.getByText('Clear all').last()).toBeVisible()
  await page.getByText('Clear all').last().click()
  await page.getByText('EDIT APPOINTMENT LOG', { exact: true }).click()

  await expect(page.getByText('Select services')).toBeVisible()
})
