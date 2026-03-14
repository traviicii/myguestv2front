import { Text, XStack, YStack } from 'tamagui'

import { OptionChip, OptionChipLabel, SurfaceCard } from 'components/ui/controls'

import { SettingsInfoButton, SettingsSection } from './sectionPrimitives'
import type { SettingsSectionProps } from './sectionTypes'

export function MetricsSettingsSection({ model }: SettingsSectionProps) {
  return (
    <SettingsSection title="Metrics">
      <SurfaceCard mode="section" tone={model.cardTone}>
        <YStack gap="$2">
          <XStack items="center" justify="space-between">
            <YStack gap="$0.5" flex={1} pr="$3">
              <XStack items="center" gap="$2">
                <Text fontSize={13}>Average ticket range</Text>
                <SettingsInfoButton
                  title="Average ticket range"
                  message="Choose whether the average ticket uses the active window or all-time appointment logs."
                  onShowInfo={model.showInfo}
                />
              </XStack>
              <Text fontSize={11} color="$textSecondary">
                This is independent from the Active/Inactive client window.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" flexWrap="wrap">
            {model.avgTicketOptions.map((option) => {
              const isActive = model.appSettings.avgTicketRange === option.id
              return (
                <OptionChip
                  key={option.id}
                  active={isActive}
                  onPress={() => model.setAppSettings({ avgTicketRange: option.id })}
                >
                  <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                </OptionChip>
              )
            })}
          </XStack>
        </YStack>
        <YStack gap="$2" mt="$2">
          <XStack items="center" justify="space-between">
            <YStack gap="$0.5" flex={1} pr="$3">
              <XStack items="center" gap="$2">
                <Text fontSize={13}>Photo coverage range</Text>
                <SettingsInfoButton
                  title="Photo coverage range"
                  message="Choose the date range used to calculate photo coverage for appointment logs."
                  onShowInfo={model.showInfo}
                />
              </XStack>
              <Text fontSize={11} color="$textSecondary">
                Photos are counted when an appointment log includes at least one image.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" flexWrap="wrap">
            {model.photoCoverageOptions.map((option) => {
              const isActive = model.appSettings.photoCoverageRange === option.id
              return (
                <OptionChip
                  key={option.id}
                  active={isActive}
                  onPress={() => model.setAppSettings({ photoCoverageRange: option.id })}
                >
                  <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                </OptionChip>
              )
            })}
          </XStack>
        </YStack>
      </SurfaceCard>
    </SettingsSection>
  )
}
