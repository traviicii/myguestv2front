import { Text, YStack } from 'tamagui'

import { PrimaryButton, TextField } from 'components/ui/controls'

import type { OnboardingSectionProps } from './sectionTypes'

export function OnboardingProfileStep({ model }: OnboardingSectionProps) {
  return (
    <YStack gap="$3">
      <Text fontSize={13} color="$textSecondary">
        Tell us about your studio so we can personalize your workspace.
      </Text>
      <TextField
        placeholder="Name"
        value={model.profileDraft.name}
        onChangeText={(text) => model.setProfileDraft((prev) => ({ ...prev, name: text }))}
      />
      <TextField
        placeholder="Email"
        keyboardType="email-address"
        value={model.profileDraft.email}
        onChangeText={(text) => model.setProfileDraft((prev) => ({ ...prev, email: text }))}
      />
      <TextField
        placeholder="Phone"
        keyboardType="phone-pad"
        value={model.profileDraft.phone}
        onChangeText={(text) => model.setProfileDraft((prev) => ({ ...prev, phone: text }))}
      />
      <PrimaryButton onPress={model.handleProfileNext}>Next</PrimaryButton>
    </YStack>
  )
}
