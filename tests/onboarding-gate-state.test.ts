import { expect, test } from '@playwright/test'

import { deriveOnboardingGateDecision } from 'components/onboarding/onboardingGateUtils'

test('onboarding gate routes empty accounts into onboarding', async () => {
  expect(
    deriveOnboardingGateDecision({
      appointmentsCount: 0,
      appointmentsError: false,
      appointmentsLoading: false,
      clientsCount: 0,
      clientsError: false,
      clientsLoading: false,
      pathname: '/',
    })
  ).toEqual({
    shouldRedirectToApp: false,
    shouldRedirectToOnboarding: true,
    showLoading: true,
  })
})

test('onboarding gate skips onboarding for accounts with real data', async () => {
  expect(
    deriveOnboardingGateDecision({
      appointmentsCount: 1,
      appointmentsError: false,
      appointmentsLoading: false,
      clientsCount: 1,
      clientsError: false,
      clientsLoading: false,
      pathname: '/onboarding',
    })
  ).toEqual({
    shouldRedirectToApp: true,
    shouldRedirectToOnboarding: false,
    showLoading: true,
  })
})

test('onboarding gate fails open when bootstrap queries error', async () => {
  expect(
    deriveOnboardingGateDecision({
      appointmentsCount: 0,
      appointmentsError: true,
      appointmentsLoading: false,
      clientsCount: 0,
      clientsError: false,
      clientsLoading: false,
      pathname: '/',
    })
  ).toEqual({
    shouldRedirectToApp: false,
    shouldRedirectToOnboarding: false,
      showLoading: false,
  })
})

test('onboarding gate leaves public routes alone', async () => {
  expect(
    deriveOnboardingGateDecision({
      appointmentsCount: 0,
      appointmentsError: false,
      appointmentsLoading: true,
      clientsCount: 0,
      clientsError: false,
      clientsLoading: true,
      pathname: '/privacy-policy',
    })
  ).toEqual({
    shouldRedirectToApp: false,
    shouldRedirectToOnboarding: false,
    showLoading: false,
  })
})
