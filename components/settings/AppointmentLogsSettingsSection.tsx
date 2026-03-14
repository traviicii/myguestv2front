import { Text, XStack, YStack } from 'tamagui'

import {
  SurfaceCard,
} from 'components/ui/controls'

import { SettingsInfoButton, SettingsSection } from './sectionPrimitives'
import type { SettingsSectionProps } from './sectionTypes'
import { ActiveServicesSection } from './appointmentLogs/ActiveServicesSection'
import { AddServiceSection } from './appointmentLogs/AddServiceSection'
import { InactiveServicesSection } from './appointmentLogs/InactiveServicesSection'

export function AppointmentLogsSettingsSection({ model }: SettingsSectionProps) {
  return (
    <SettingsSection title="Appointment Logs">
      <SurfaceCard mode="section" tone={model.cardTone}>
        <XStack items="center" justify="space-between">
          <YStack gap="$0.5" flex={1} pr="$3">
            <XStack items="center" gap="$2">
              <Text fontSize={13}>Service dropdown options</Text>
              <SettingsInfoButton
                title="Service dropdown options"
                message="Controls the selectable services shown when creating or editing an appointment log."
                onShowInfo={model.showInfo}
              />
            </XStack>
            <Text fontSize={11} color="$textSecondary">
              Names are formatted automatically (example: balayage {'->'} Balayage).
            </Text>
          </YStack>
        </XStack>

        <ActiveServicesSection model={model} />
        <InactiveServicesSection model={model} />
        <AddServiceSection model={model} />
      </SurfaceCard>
    </SettingsSection>
  )
}
