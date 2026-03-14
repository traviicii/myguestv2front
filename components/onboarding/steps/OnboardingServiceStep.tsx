import { Text, XStack, YStack } from 'tamagui'

import {
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextField,
} from 'components/ui/controls'

import type { OnboardingSectionProps } from './sectionTypes'

export function OnboardingServiceStep({ model }: OnboardingSectionProps) {
  return (
    <YStack gap="$3">
      <Text fontSize={13} color="$textSecondary">
        Presets save time when you log appointments. You can add more later from the log.
      </Text>
      <YStack gap="$2">
        {model.serviceOptions.map((service) => (
          <Text key={service.id} fontSize={12} color="$textSecondary">
            • {service.name}
          </Text>
        ))}
      </YStack>
      <SectionDivider />
      <TextField
        placeholder="Add another preset"
        value={model.serviceDraft}
        onChangeText={model.setServiceDraft}
      />
      <XStack gap="$3">
        <SecondaryButton flex={1} onPress={() => model.setStep(3)}>
          Skip
        </SecondaryButton>
        <PrimaryButton flex={1} onPress={() => void model.handleAddService()}>
          Add preset
        </PrimaryButton>
      </XStack>
      <PrimaryButton onPress={() => model.setStep(3)}>Next</PrimaryButton>
    </YStack>
  )
}
