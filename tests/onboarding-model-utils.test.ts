import { expect, test } from '@playwright/test'

import {
  canGoBackOnboardingStep,
  canAdvanceOnboardingClientStep,
  formatOnboardingTodayLabel,
  getPreviousOnboardingStep,
  getOnboardingStepSubtitle,
  getOnboardingStepTitle,
  getSelectedOnboardingServiceName,
  normalizeOnboardingPrice,
} from 'components/onboarding/onboardingModelUtils'

test('onboarding helpers derive dates and step titles deterministically', async () => {
  expect(formatOnboardingTodayLabel(new Date('2026-03-13T12:00:00Z'))).toBe('03/13/2026')
  expect(getOnboardingStepTitle(1)).toBe('Workspace')
  expect(getOnboardingStepTitle(2)).toBe('Services')
  expect(getOnboardingStepTitle(3)).toBe('First Client')
  expect(getOnboardingStepTitle(4)).toBe('First Appointment Log')
  expect(getOnboardingStepSubtitle(1)).toMatch(/workspace feels like yours/i)
  expect(getOnboardingStepSubtitle(4)).toMatch(/finish setup/i)
})

test('onboarding helpers validate client advancement and price parsing', async () => {
  expect(canAdvanceOnboardingClientStep(' Avery ', 'Stone ')).toBe(true)
  expect(canAdvanceOnboardingClientStep(' ', 'Stone')).toBe(false)
  expect(canGoBackOnboardingStep(1)).toBe(false)
  expect(canGoBackOnboardingStep(4)).toBe(true)
  expect(getPreviousOnboardingStep(4)).toBe(3)
  expect(getPreviousOnboardingStep(2)).toBe(1)
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
