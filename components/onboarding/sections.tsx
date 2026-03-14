import { ScrollView, Text, YStack } from 'tamagui'

import {
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'

import { OnboardingStepContent } from './steps/OnboardingStepContent'
import type { OnboardingScreenModel } from './useOnboardingScreenModel'

type OnboardingSectionProps = {
  model: OnboardingScreenModel
}

export function OnboardingContent({ model }: OnboardingSectionProps) {
  return (
    <YStack flex={1} bg="$surfacePage">
      <ScrollView
        contentContainerStyle={
          { paddingBottom: Math.max(24, model.insets.bottom + 24) } as any
        }
      >
        <YStack px="$5" pt={Math.max(model.insets.top + 16, 32)} gap="$4">
          <ThemedHeadingText fontSize={18} fontWeight="700">
            Welcome to MyGuest v2
          </ThemedHeadingText>
          <Text fontSize={12} color="$textSecondary">
            Step {model.step} of 4 · {model.stepTitle}
          </Text>

          <SurfaceCard tone={model.cardTone} p="$5" gap="$4">
            <OnboardingStepContent model={model} />
          </SurfaceCard>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
