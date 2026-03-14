import { Text, XStack, YStack } from 'tamagui'

import {
  FieldLabel,
  SurfaceCard,
  ThemedSwitch,
} from 'components/ui/controls'

import { OptionChipList, ProfileSectionTitle } from './ProfileSectionPrimitives'
import type { ProfileSectionProps } from './sectionTypes'

export function ProfilePreferencesSection({ model }: ProfileSectionProps) {
  return (
    <YStack gap={model.sectionGap}>
      <ProfileSectionTitle>Preferences</ProfileSectionTitle>
      <SurfaceCard tone={model.cardTone}>
        <XStack items="center" justify="space-between">
          <Text fontSize={13} color="$textPrimary">
            Notifications
          </Text>
          <ThemedSwitch
            size="$2"
            checked={model.preferences.notificationsEnabled}
            onCheckedChange={(checked) =>
              model.setPreferences({ notificationsEnabled: Boolean(checked) })
            }
          />
        </XStack>
        <YStack gap="$2">
          <FieldLabel>Auto rebook prompts</FieldLabel>
          <OptionChipList
            options={model.preferenceOptions.autoRebook}
            selected={model.preferences.autoRebook}
            onSelect={(value) => model.setPreferences({ autoRebook: value })}
          />
        </YStack>
        <YStack gap="$2">
          <FieldLabel>Data exports</FieldLabel>
          <OptionChipList
            options={model.preferenceOptions.dataExports}
            selected={model.preferences.dataExports}
            onSelect={(value) => model.setPreferences({ dataExports: value })}
          />
        </YStack>
      </SurfaceCard>
    </YStack>
  )
}
