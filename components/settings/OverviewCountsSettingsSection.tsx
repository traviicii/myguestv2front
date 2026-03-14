import { Minus, Plus } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  SecondaryButton,
  SurfaceCard,
} from 'components/ui/controls'

import { SettingsInfoButton, SettingsSection } from './sectionPrimitives'
import type { SettingsSectionProps } from './sectionTypes'

export function OverviewCountsSettingsSection({ model }: SettingsSectionProps) {
  return (
    <SettingsSection title="Overview">
      <SurfaceCard mode="section" tone={model.cardTone}>
        {model.displayRows.map((row) => (
          <XStack key={row.id} items="center" justify="space-between">
            <YStack gap="$0.5" flex={1} pr="$3">
              <XStack items="center" gap="$2">
                <Text fontSize={13}>{row.label}</Text>
                <SettingsInfoButton
                  title={row.label}
                  message={row.help}
                  onShowInfo={model.showInfo}
                />
              </XStack>
              <Text fontSize={11} color="$textSecondary">
                Currently showing {row.value} items.
              </Text>
            </YStack>
            <XStack items="center" gap="$1.5">
              <SecondaryButton
                size="$2"
                px="$2"
                icon={<Minus size={14} />}
                disabled={row.value <= 1}
                opacity={row.value <= 1 ? 0.45 : 1}
                onPress={() => model.updatePreviewCount(row.id, -1)}
              />
              <YStack width={30} items="center">
                <Text fontSize={13} fontWeight="700">
                  {row.value}
                </Text>
              </YStack>
              <SecondaryButton
                size="$2"
                px="$2"
                icon={<Plus size={14} />}
                disabled={row.value >= 12}
                opacity={row.value >= 12 ? 0.45 : 1}
                onPress={() => model.updatePreviewCount(row.id, 1)}
              />
            </XStack>
          </XStack>
        ))}
      </SurfaceCard>
    </SettingsSection>
  )
}
