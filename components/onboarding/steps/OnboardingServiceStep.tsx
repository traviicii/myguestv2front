import { Text, XStack, YStack } from 'tamagui'

import {
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextField,
} from 'components/ui/controls'

import type { OnboardingSectionProps } from './sectionTypes'

export function OnboardingServiceStep({ model }: OnboardingSectionProps) {
  return (
    <YStack gap="$3.5">
      <Text fontSize={13} color="$textSecondary">
        Starter services are already ready. Add a custom one if you want, or keep moving.
      </Text>
      {model.serviceOptions.length ? (
        <YStack gap="$2.5">
          <FieldLabel>Ready to Use</FieldLabel>
          {model.serviceOptions.map((service) => (
            <Text key={service.id} fontSize={12} color="$textSecondary">
              • {service.name}
            </Text>
          ))}
        </YStack>
      ) : (
        <Text fontSize={12} color="$textSecondary">
          No presets yet. Add one now or keep moving.
        </Text>
      )}
      <SectionDivider />
      <TextField
        placeholder="Add a custom service"
        value={model.serviceDraft}
        onChangeText={model.setServiceDraft}
      />
      <XStack gap="$3">
        <PrimaryButton flex={1} onPress={() => model.setStep(3)}>
          Continue
        </PrimaryButton>
        <SecondaryButton flex={1} onPress={() => void model.handleAddService()}>
          Add Service
        </SecondaryButton>
      </XStack>
    </YStack>
  )
}
