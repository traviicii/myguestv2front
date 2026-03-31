import { ArrowLeft } from '@tamagui/lucide-icons'
import { ScrollView, Text, YStack } from 'tamagui'

import {
  GhostButton,
  SectionHeader,
  SurfaceCard,
  ThemedEyebrowText,
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
        <YStack px="$5" pt={Math.max(model.insets.top + 18, 36)} gap="$5">
          <YStack gap="$2">
            <ThemedEyebrowText>First Run</ThemedEyebrowText>
            <SectionHeader
              title="Welcome to MyGuest"
              subtitle="We’ll set up your workspace, add your first client, and log the first appointment without slowing you down."
            />
            <Text fontSize={11} color="$textSecondary">
              About 2 minutes. You can change any of this later.
            </Text>
          </YStack>

          <SurfaceCard tone={model.cardTone} p="$5" gap="$5">
            {model.canGoBack ? (
              <YStack items="flex-start">
                <GhostButton icon={ArrowLeft} onPress={model.handleBackStep}>
                  Back
                </GhostButton>
              </YStack>
            ) : null}
            <SectionHeader
              eyebrow={`Step ${model.step} of 4`}
              title={model.stepTitle}
              subtitle={model.stepSubtitle}
            />
            <OnboardingStepContent model={model} />
          </SurfaceCard>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
