import { Mail, Phone } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextField,
  ThemedHeadingText,
} from 'components/ui/controls'

import type { ProfileSectionProps } from './sectionTypes'

export function ProfileSummaryCard({ model }: ProfileSectionProps) {
  return (
    <SurfaceCard p={model.isModern ? '$6' : '$5'} gap={model.sectionGap} tone={model.cardTone}>
      <XStack items="center" justify="space-between">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Profile
        </ThemedHeadingText>
        <XStack
          px="$2"
          py="$1"
          rounded="$3"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => model.setIsEditing((prev) => !prev)}
        >
          <Text fontSize={12} color="$accent">
            {model.isEditing ? 'Close' : 'Edit'}
          </Text>
        </XStack>
      </XStack>
      <Text fontSize={13} color="$textSecondary">
        Your personal contact details.
      </Text>
      <YStack gap="$2">
        {model.isEditing ? (
          <YStack gap="$2">
            <TextField
              placeholder="Name"
              value={model.draftProfile.name}
              onChangeText={(text) =>
                model.setDraftProfile((prev) => ({ ...prev, name: text }))
              }
            />
            <TextField
              placeholder="Email"
              keyboardType="email-address"
              value={model.displayEmail}
              onChangeText={(text) =>
                model.setDraftProfile((prev) => ({ ...prev, email: text }))
              }
              disabled={Boolean(model.user?.email)}
              opacity={model.user?.email ? 0.6 : 1}
            />
            <TextField
              placeholder="Phone"
              keyboardType="phone-pad"
              value={model.draftProfile.phone}
              onChangeText={(text) =>
                model.setDraftProfile((prev) => ({ ...prev, phone: text }))
              }
            />
          </YStack>
        ) : (
          <>
            <Text fontSize={16} fontWeight="700" color="$textPrimary">
              {model.profile.name}
            </Text>
            <XStack items="center" gap="$2">
              <Mail size={14} color="$textSecondary" />
              <Text fontSize={12} color="$textSecondary">
                {model.displayEmail}
              </Text>
            </XStack>
            {model.showPhone ? (
              <XStack items="center" gap="$2">
                <Phone size={14} color="$textSecondary" />
                <Text fontSize={12} color="$textSecondary">
                  {model.profile.phone}
                </Text>
              </XStack>
            ) : null}
          </>
        )}
      </YStack>
      {model.isEditing ? (
        <XStack gap="$3" pt="$1">
          <SecondaryButton flex={1} onPress={model.handleCancelProfile}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            flex={1}
            onPress={model.handleSaveProfile}
            disabled={!model.canSaveProfile}
            opacity={model.canSaveProfile ? 1 : 0.5}
          >
            Save
          </PrimaryButton>
        </XStack>
      ) : null}
    </SurfaceCard>
  )
}
