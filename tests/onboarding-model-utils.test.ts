import { expect, test } from '@playwright/test'

import {
  canAdvanceOnboardingClientStep,
  formatOnboardingTodayLabel,
  getOnboardingStepTitle,
  getSelectedOnboardingServiceName,
  normalizeOnboardingPrice,
} from 'components/onboarding/onboardingModelUtils'

test('onboarding helpers derive dates and step titles deterministically', async () => {
  expect(formatOnboardingTodayLabel(new Date('2026-03-13T12:00:00Z'))).toBe('03/13/2026')
  expect(getOnboardingStepTitle(1)).toBe('Studio Profile')
  expect(getOnboardingStepTitle(2)).toBe('Service Presets (Optional)')
  expect(getOnboardingStepTitle(3)).toBe('First Client')
  expect(getOnboardingStepTitle(4)).toBe('First Appointment Log')
})

test('onboarding helpers validate client advancement and price parsing', async () => {
  expect(canAdvanceOnboardingClientStep(' Avery ', 'Stone ')).toBe(true)
  expect(canAdvanceOnboardingClientStep(' ', 'Stone')).toBe(false)
  expect(normalizeOnboardingPrice('')).toBeNull()
  expect(normalizeOnboardingPrice('265')).toBe(265)
  expect(normalizeOnboardingPrice('oops')).toBeNull()
})

test('onboarding helpers resolve selected service names safely', async () => {
  const services = [
    { id: 1, name: 'Cut' },
    { id: 2, name: 'Color' },
  ]

  expect(getSelectedOnboardingServiceName(services, 2)).toBe('Color')
  expect(getSelectedOnboardingServiceName(services, 99)).toBeNull()
  expect(getSelectedOnboardingServiceName(services, null)).toBeNull()
})
