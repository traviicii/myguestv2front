import { Link } from 'expo-router'
import { Trash2 } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { SurfaceCard } from 'components/ui/controls'

import { SettingsSection } from './sectionPrimitives'
import type { SettingsSectionProps } from './sectionTypes'

export function AccountSettingsSection({ model }: SettingsSectionProps) {
  return (
    <SettingsSection title="Account">
      <Link href="/account-delete" asChild>
        <SurfaceCard mode="section" tone={model.cardTone} pressStyle={{ opacity: 0.85 }}>
          <XStack items="center" gap="$3" flexWrap="wrap">
            <Trash2 size={16} color="$danger" />
            <YStack flex={1} minW={0}>
              <Text fontSize={13} color="$danger" fontWeight="600">
                Delete account
              </Text>
              <Text fontSize={11} color="$textSecondary">
                Permanently remove your account and all associated data.
              </Text>
            </YStack>
          </XStack>
        </SurfaceCard>
      </Link>
    </SettingsSection>
  )
}
