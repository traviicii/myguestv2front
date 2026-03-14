import { OnboardingAppointmentStep } from './OnboardingAppointmentStep'
import { OnboardingClientStep } from './OnboardingClientStep'
import { OnboardingProfileStep } from './OnboardingProfileStep'
import { OnboardingServiceStep } from './OnboardingServiceStep'
import type { OnboardingSectionProps } from './sectionTypes'

export function OnboardingStepContent({ model }: OnboardingSectionProps) {
  if (model.step === 1) return <OnboardingProfileStep model={model} />
  if (model.step === 2) return <OnboardingServiceStep model={model} />
  if (model.step === 3) return <OnboardingClientStep model={model} />
  return <OnboardingAppointmentStep model={model} />
}
