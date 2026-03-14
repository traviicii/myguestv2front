import { Text, XStack, YStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  SurfaceCard,
  ThemedSwitch,
} from 'components/ui/controls'

import { SettingsInfoButton, SettingsSection } from './sectionPrimitives'
import type { SettingsSectionProps } from './sectionTypes'

export function DatesSettingsSection({ model }: SettingsSectionProps) {
  return (
    <SettingsSection title="Dates">
      <SurfaceCard mode="section" tone={model.cardTone}>
        <YStack gap="$2">
          <XStack items="center" justify="space-between">
            <YStack gap="$0.5" flex={1} pr="$3">
              <XStack items="center" gap="$2">
                <Text fontSize={13}>Date format</Text>
                <SettingsInfoButton
                  title="Date format"
                  message="Controls the app-wide date display style. Today is still shown as 'Today'."
                  onShowInfo={model.showInfo}
                />
              </XStack>
              <Text fontSize={11} color="$textSecondary">
                Applies globally, with compact cards kept short for readability.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" flexWrap="wrap">
            {model.appointmentDateOptions.map((option) => {
              const isActive = model.appSettings.dateDisplayFormat === option.id
              return (
                <OptionChip
                  key={option.id}
                  active={isActive}
                  onPress={() => model.setAppSettings({ dateDisplayFormat: option.id })}
                >
                  <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                </OptionChip>
              )
            })}
          </XStack>
        </YStack>
        {model.appSettings.dateDisplayFormat === 'long' ? (
          <YStack gap="$2" pl="$3" borderLeftWidth={1} borderLeftColor="$borderSubtle">
            <XStack items="center" justify="space-between">
              <YStack gap="$0.5" flex={1} pr="$3">
                <XStack items="center" gap="$2">
                  <Text fontSize={13}>Include weekday</Text>
                  <SettingsInfoButton
                    title="Include weekday"
                    message="When long format is enabled, include the weekday in dates."
                    onShowInfo={model.showInfo}
                  />
                </XStack>
                <Text fontSize={11} color="$textSecondary">
                  Example: Monday, October 4th 2026
                </Text>
              </YStack>
              <ThemedSwitch
                size="$2"
                checked={model.appSettings.dateLongIncludeWeekday}
                onCheckedChange={(checked) =>
                  model.setAppSettings({
                    dateLongIncludeWeekday: Boolean(checked),
                  })
                }
              />
            </XStack>
          </YStack>
        ) : null}
      </SurfaceCard>
    </SettingsSection>
  )
}
