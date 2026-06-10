import { expect, test, type Page } from '@playwright/test'

async function openSheet(page: Page, testId: string) {
  await expect(page.getByTestId(testId)).toBeVisible()
}

async function dismissSheet(page: Page, testId: string) {
  const sheet = page.getByTestId(testId)
  await sheet.getByText('Done', { exact: true }).click({ force: true })
  await expect(sheet).toHaveCount(0)
}

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
  await expect(page.getByText('Also Glaze')).toBeVisible()
  await expect(page.getByText('$265')).toBeVisible()
  await expect(page.getByText('Color chart updated')).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Full Chart' }).first()).toBeVisible()
})

test('client edit route loads existing client values in mock mode', async ({ page }) => {
  await page.goto('/clients', { waitUntil: 'networkidle' })
  await page.getByText('Avery Stone', { exact: true }).first().click()
  await page.getByRole('button', { name: 'Edit' }).click()
  await expect(page).toHaveURL(/\/client\/c-101\/edit$/)

  await expect(page.getByText('Edit Client')).toBeVisible()
  await expect(page.getByRole('textbox').first()).toHaveValue('Avery')
  await expect(page.getByText('Client Groups', { exact: true })).toBeVisible()
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
  await expect(page.getByTestId('control-row-theme-preferences')).toBeVisible()
  await expect(page.getByTestId('control-row-client-display')).toBeVisible()
  await expect(page.getByTestId('control-row-overview-insights')).toBeVisible()
  await expect(page.getByTestId('control-row-services-logs')).toBeVisible()
  await expect(page.getByTestId('control-row-dates-formatting')).toBeVisible()
  await expect(page.getByTestId('control-row-data-privacy')).toBeVisible()
  await expect(page.getByText(/^account$/i)).toBeVisible()
  await expect(page.getByText('Delete Account')).toHaveCount(0)

  await page.getByTestId('control-row-theme-preferences').click()
  await expect(page).toHaveURL(/\/theme-preferences$/)
  await expect(page.getByText(/^current theme$/i)).toBeVisible()
  await expect(page.getByText(/^customize$/i)).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/profile$/)

  await page.getByText('Edit').last().click()
  await expect(page.getByRole('textbox', { name: /^name$/i })).toBeVisible()
  await expect(page.getByPlaceholder('(555) 555-5555')).toBeVisible()
})

test('settings route opens grouped detail sheets and honors focus params in mock mode', async ({
  page,
}) => {
  await page.goto('/settings', { waitUntil: 'networkidle' })

  await expect(page.getByTestId('settings-row-client-display')).toBeVisible()
  await expect(page.getByTestId('settings-row-overview-insights')).toBeVisible()
  await expect(page.getByTestId('settings-row-services-logs')).toBeVisible()
  await expect(page.getByTestId('settings-row-dates-formatting')).toBeVisible()

  await page.getByTestId('settings-row-services-logs').click()
  await expect(page).toHaveURL(/\/settings\/services-logs$/)
  await expect(page.getByTestId('settings-screen-services-logs')).toBeVisible()

  await page.goto('/settings?focus=client-display', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/settings\/client-display(?:\?.*)?$/)
  await expect(page.getByTestId('settings-screen-client-display')).toBeVisible()
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

  await page.getByTestId('clients-filter-button').click()
  await openSheet(page, 'clients-filter-sheet')
  await page.getByText('Inactive', { exact: true }).last().click()

  await expect(page.getByTestId('clients-filter-sheet')).toBeVisible()
  await expect(page.getByText('No clients match your search or filters.')).toBeVisible()

  await page.getByTestId('clients-filter-reset').click()
  await expect(page.getByTestId('clients-filter-sheet')).toBeVisible()
  await expect(page.getByText('Marco Vale')).toBeVisible()
  await expect(searchInput).toHaveValue('Marco')

  await page.getByTestId('clients-filter-group-color').click()
  await expect(page.getByText('No clients match your search or filters.')).toBeVisible()

  await page.getByTestId('clients-filter-group-cut').click()
  await expect(page.getByText('Marco Vale')).toBeVisible()

  await page.getByTestId('clients-filter-group-all').click()
  await expect(page.getByText('Marco Vale')).toBeVisible()

  await page.getByText('Overdue', { exact: true }).last().click()
  await expect(page.getByText('Marco Vale')).toBeVisible()

  await page.getByText('Due This Week', { exact: true }).last().click()
  await expect(page.getByText('No clients match your search or filters.')).toBeVisible()

  await dismissSheet(page, 'clients-filter-sheet')
})

test('client add and edit flows persist client group assignments in mock mode', async ({
  page,
}) => {
  await page.goto('/clients/new', { waitUntil: 'networkidle' })

  await page.getByPlaceholder('First name').fill('Sasha')
  await page.getByPlaceholder('Last name').fill('Reed')
  await page.getByTestId('client-group-chip-color').click()
  await page.getByTestId('client-group-create-input').fill('Blowouts')
  await page.getByTestId('client-group-create-button').click()
  await expect(page.getByTestId('client-group-chip-blowouts')).toBeVisible()

  await page.getByRole('button', { name: 'Save Client' }).click()
  await expect(page).toHaveURL(/\/clients$/)

  const searchInput = page.getByPlaceholder('Search clients, tags, notes')
  await searchInput.fill('Sasha')
  await expect(page.getByText('Sasha Reed', { exact: true }).last()).toBeVisible()
  await expect(page.getByText(/Color \+ Blowouts/).last()).toBeVisible()

  await page.getByText('Sasha Reed', { exact: true }).last().click()
  await page.getByRole('button', { name: 'Edit' }).click()
  await expect(page).toHaveURL(/\/client\/c-\d+\/edit$/)

  await page.getByTestId('client-group-chip-vip').click()
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByText('Sasha Reed', { exact: true }).last()).toBeVisible()
  await expect(page.getByText('Color', { exact: true }).last()).toBeVisible()
  await expect(page.getByText('VIP', { exact: true }).last()).toBeVisible()
  await expect(page.getByText('Blowouts', { exact: true }).last()).toBeVisible()
})

test('settings manages client groups in mock mode', async ({ page }) => {
  await page.goto('/settings/client-display', { waitUntil: 'networkidle' })

  await expect(page.getByTestId('settings-screen-client-display')).toBeVisible()
  await expect(page.getByTestId('settings-client-group-restore-extensions')).toBeVisible()

  await page.getByTestId('settings-client-group-restore-extensions').click()
  await expect(page.getByTestId('settings-client-group-card-extensions')).toBeVisible()

  await page.getByTestId('settings-client-group-add-input').fill('Blowouts')
  await page.getByTestId('settings-client-group-add-button').click()
  await expect(page.getByTestId('settings-client-group-card-blowouts')).toBeVisible()

  await page.getByTestId('settings-client-group-archive-blowouts').click()
  await expect(page.getByTestId('settings-client-group-restore-blowouts')).toBeVisible()
})

test('appointment client picker route filters clients and opens a client log flow in mock mode', async ({
  page,
}) => {
  await page.goto('/appointments/new', { waitUntil: 'networkidle' })

  await expect(page).toHaveURL(/\/appointments\/new$/)
  await expect(page.getByPlaceholder('Search clients')).toBeVisible()
  await page.getByPlaceholder('Search clients').fill('Avery')
  await page
    .getByRole('link', { name: 'Avery Stone Cut + Color +1 • Last visit 03/07/2026 Select' })
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
  const dateValue = page.getByText(/^\d{2}\/\d{2}\/\d{4}$/).first()
  await expect(dateValue).toBeVisible()

  await dateValue.click()
  await openSheet(page, 'appointment-date-picker-sheet')
  await dismissSheet(page, 'appointment-date-picker-sheet')

  await page.getByText('Select services').click()
  await openSheet(page, 'appointment-service-picker-sheet')
  await expect(page.getByText('Clear all').last()).toBeVisible()

  await page.getByText('Cut', { exact: true }).last().click()
  await dismissSheet(page, 'appointment-service-picker-sheet')

  await expect(page.getByText('Select services')).toHaveCount(0)
})

test('edit appointment route uses sheets for pickers and supports clearing selected services', async ({
  page,
}) => {
  await page.goto('/appointments', { waitUntil: 'networkidle' })

  await page
    .getByRole('link', { name: 'Cut & Color Avery Stone 03/07/2026 $265' })
    .click()
  await page.getByRole('button', { name: 'Edit' }).click()

  await expect(page.getByText('EDIT APPOINTMENT LOG', { exact: true })).toBeVisible()
  await expect(page.getByText('Avery Stone', { exact: true }).last()).toBeVisible()
  const dateValue = page.getByText('03/07/2026', { exact: true }).last()
  await expect(dateValue).toBeVisible()

  await page.getByText('Cut & Color +1').click()
  await openSheet(page, 'appointment-service-picker-sheet')
  await expect(page.getByText('Clear all').last()).toBeVisible()
  await page.getByText('Clear all').last().click()
  await expect(page.getByTestId('appointment-service-picker-sheet')).toBeVisible()
  await dismissSheet(page, 'appointment-service-picker-sheet')

  await expect(page.getByText('Select services')).toBeVisible()

  await dateValue.click()
  await openSheet(page, 'appointment-date-picker-sheet')
  await dismissSheet(page, 'appointment-date-picker-sheet')
})
