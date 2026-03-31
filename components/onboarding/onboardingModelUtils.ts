import { formatDateMMDDYYYY } from 'components/utils/date'

export const ONBOARDING_CLIENT_TYPES = ['Cut', 'Color', 'Cut & Color'] as const

export type OnboardingClientType = (typeof ONBOARDING_CLIENT_TYPES)[number]
export type OnboardingStep = 1 | 2 | 3 | 4

const padDatePart = (value: number) => String(value).padStart(2, '0')

export function formatOnboardingTodayLabel(date = new Date()) {
  return formatDateMMDDYYYY(
    `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
  )
}

export function getOnboardingStepTitle(step: OnboardingStep) {
  if (step === 1) return 'Workspace'
  if (step === 2) return 'Services'
  if (step === 3) return 'First Client'
  return 'First Appointment Log'
}

export function getOnboardingStepSubtitle(step: OnboardingStep) {
  if (step === 1) return 'Add a few details so the workspace feels like yours.'
  if (step === 2) return 'Starter services are ready. Add one if you want, or keep moving.'
  if (step === 3) return 'Create one real client record so the app has something to work with.'
  return 'Log the first appointment now, or finish setup and come back later.'
}

export function canGoBackOnboardingStep(step: OnboardingStep) {
  return step > 1
}

export function getPreviousOnboardingStep(step: OnboardingStep): OnboardingStep {
  if (step === 4) return 3
  if (step === 3) return 2
  return 1
}

export function canAdvanceOnboardingClientStep(firstName: string, lastName: string) {
  return Boolean(firstName.trim() && lastName.trim())
}

export function normalizeOnboardingPrice(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

export function getSelectedOnboardingServiceName(
  serviceOptions: { id: number; name: string }[],
  selectedServiceId: number | null
) {
  return serviceOptions.find((item) => item.id === selectedServiceId)?.name ?? null
}
