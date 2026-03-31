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
              <Text fontSize={13}>Service catalog</Text>
              <SettingsInfoButton
                title="Service catalog"
                message="Controls which services appear in appointment logs, the order they appear in, and any default prices."
                onShowInfo={model.showInfo}
              />
            </XStack>
            <Text fontSize={11} color="$textSecondary">
              Choose what appears in appointment logs, set a default order, and keep
              prices ready for new entries.
            </Text>
          </YStack>
        </XStack>

        <YStack gap="$4">
          <ActiveServicesSection model={model} />
          <InactiveServicesSection model={model} />
          <AddServiceSection model={model} />
        </YStack>
      </SurfaceCard>
    </SettingsSection>
  )
}
