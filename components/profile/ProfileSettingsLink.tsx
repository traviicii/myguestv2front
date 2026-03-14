import { Link } from 'expo-router'
import { Settings } from '@tamagui/lucide-icons'
import { Text, XStack } from 'tamagui'

import { SurfaceCard } from 'components/ui/controls'

import type { ProfileSectionProps } from './sectionTypes'

export function ProfileSettingsLink({ model }: ProfileSectionProps) {
  return (
    <Link href="/settings" asChild>
      <SurfaceCard mode="section" p="$4" tone={model.cardTone}>
        <XStack items="center" gap="$3">
          <Settings size={16} color="$textSecondary" />
          <Text fontSize={13} color="$textSecondary">
            App settings
          </Text>
        </XStack>
      </SurfaceCard>
    </Link>
  )
}
