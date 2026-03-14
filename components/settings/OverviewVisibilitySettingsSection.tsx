import { Text, XStack } from 'tamagui'

import { SurfaceCard, ThemedSwitch } from 'components/ui/controls'

import { SettingsInfoButton, SettingsSection } from './sectionPrimitives'
import type { SettingsSectionProps } from './sectionTypes'

export function OverviewVisibilitySettingsSection({ model }: SettingsSectionProps) {
  return (
    <SettingsSection title="Overview">
      <SurfaceCard mode="section" tone={model.cardTone}>
        {model.overviewSectionOptions.map((section) => (
          <XStack key={section.id} items="center" justify="space-between">
            <XStack items="center" gap="$2" flex={1} pr="$3">
              <Text fontSize={13}>{section.label}</Text>
              <SettingsInfoButton
                title={section.label}
                message={section.help}
                onShowInfo={model.showInfo}
              />
            </XStack>
            <ThemedSwitch
              size="$2"
              checked={model.appSettings.overviewSections[section.id]}
              onCheckedChange={(checked) =>
                model.setAppSettings({
                  overviewSections: {
                    ...model.appSettings.overviewSections,
                    [section.id]: Boolean(checked),
                  },
                })
              }
            />
          </XStack>
        ))}
      </SurfaceCard>
    </SettingsSection>
  )
}
