import { Text, YStack } from 'tamagui'

import { PrimaryButton, TextField } from 'components/ui/controls'
import { PHONE_INPUT_PLACEHOLDER, formatPhoneForInput } from 'components/utils/phone'

import type { OnboardingSectionProps } from './sectionTypes'

export function OnboardingProfileStep({ model }: OnboardingSectionProps) {
  return (
    <YStack gap="$3.5">
      <Text fontSize={13} color="$textSecondary">
        We’ll use this across your workspace so everything feels personal from the start.
      </Text>
      {model.authEmail ? (
        <YStack gap="$1.5">
          <Text fontSize={11} color="$textSecondary">
            Signed in as
          </Text>
          <Text fontSize={13} color="$textPrimary" fontWeight="600">
            {model.authEmail}
          </Text>
        </YStack>
      ) : null}
      <TextField
        placeholder="Display name"
        value={model.profileDraft.name}
        onChangeText={(text) => model.setProfileDraft((prev) => ({ ...prev, name: text }))}
      />
      <TextField
        placeholder={PHONE_INPUT_PLACEHOLDER}
        keyboardType="phone-pad"
        value={model.profileDraft.phone}
        onChangeText={(text) =>
          model.setProfileDraft((prev) => ({ ...prev, phone: formatPhoneForInput(text) }))
        }
      />
      <PrimaryButton onPress={model.handleProfileNext}>Continue</PrimaryButton>
    </YStack>
  )
}
