import { OnboardingContent } from 'components/onboarding/sections'
import { useOnboardingScreenModel } from 'components/onboarding/useOnboardingScreenModel'

export default function OnboardingScreen() {
  const model = useOnboardingScreenModel()
  return <OnboardingContent model={model} />
}
