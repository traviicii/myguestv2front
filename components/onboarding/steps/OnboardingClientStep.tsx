import { Text, XStack, YStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  PrimaryButton,
  TextField,
} from 'components/ui/controls'

import {
  ONBOARDING_CLIENT_TYPES,
  type OnboardingClientType,
} from '../onboardingModelUtils'
import type { OnboardingSectionProps } from './sectionTypes'

export function OnboardingClientStep({ model }: OnboardingSectionProps) {
  return (
    <YStack gap="$3">
      <Text fontSize={13} color="$textSecondary">
        Add your first client so you can log an appointment.
      </Text>
      <TextField
        placeholder="First name"
        value={model.clientDraft.firstName}
        onChangeText={(text) => model.setClientDraft((prev) => ({ ...prev, firstName: text }))}
      />
      <TextField
        placeholder="Last name"
        value={model.clientDraft.lastName}
        onChangeText={(text) => model.setClientDraft((prev) => ({ ...prev, lastName: text }))}
      />
      <TextField
        placeholder="Email (optional)"
        keyboardType="email-address"
        value={model.clientDraft.email}
        onChangeText={(text) => model.setClientDraft((prev) => ({ ...prev, email: text }))}
      />
      <TextField
        placeholder="Phone (optional)"
        keyboardType="phone-pad"
        value={model.clientDraft.phone}
        onChangeText={(text) => model.setClientDraft((prev) => ({ ...prev, phone: text }))}
      />
      <XStack gap="$2" flexWrap="wrap">
        {ONBOARDING_CLIENT_TYPES.map((type) => (
          <OptionChip
            key={type}
            active={model.clientDraft.clientType === type}
            onPress={() =>
              model.setClientDraft((prev) => ({
                ...prev,
                clientType: type as OnboardingClientType,
              }))
            }
          >
            <OptionChipLabel active={model.clientDraft.clientType === type}>
              {type}
            </OptionChipLabel>
          </OptionChip>
        ))}
      </XStack>
      <PrimaryButton
        disabled={!model.canAdvanceClient || model.isSaving}
        onPress={() => void model.handleClientNext()}
      >
        {model.isSaving ? 'Saving...' : 'Next'}
      </PrimaryButton>
    </YStack>
  )
}
