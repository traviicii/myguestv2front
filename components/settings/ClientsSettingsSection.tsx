import { Text, XStack, YStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  SurfaceCard,
  ThemedSwitch,
} from 'components/ui/controls'

import { SettingsInfoButton, SettingsSection } from './sectionPrimitives'
import type { SettingsSectionProps } from './sectionTypes'

export function ClientsSettingsSection({ model }: SettingsSectionProps) {
  return (
    <SettingsSection title="Clients">
      <SurfaceCard mode="section" tone={model.cardTone}>
        <XStack items="center" justify="space-between">
          <YStack gap="$0.5" flex={1} pr="$3">
            <XStack items="center" gap="$2">
              <Text fontSize={13}>Active/Inactive indicator</Text>
              <SettingsInfoButton
                title="Active/Inactive indicator"
                message="Toggle status labels that show whether a client has visited recently."
                onShowInfo={model.showInfo}
              />
            </XStack>
            <Text fontSize={11} color="$textSecondary">
              Show client status labels in the list.
            </Text>
          </YStack>
          <ThemedSwitch
            size="$2"
            checked={model.appSettings.clientsShowStatus}
            onCheckedChange={(checked) =>
              model.setAppSettings({ clientsShowStatus: Boolean(checked) })
            }
          />
        </XStack>
        {model.appSettings.clientsShowStatus ? (
          <YStack gap="$2" pl="$3" borderLeftWidth={1} borderLeftColor="$borderSubtle">
            <XStack items="center" justify="space-between">
              <YStack gap="$0.5" flex={1} pr="$3">
                <XStack items="center" gap="$2">
                  <Text fontSize={13}>Active window</Text>
                  <SettingsInfoButton
                    title="Active window"
                    message="Choose how far back a visit counts as active."
                    onShowInfo={model.showInfo}
                  />
                </XStack>
                <Text fontSize={11} color="$textSecondary">
                  Clients are active if they visited within this timeframe.
                </Text>
              </YStack>
            </XStack>
            <XStack gap="$2" flexWrap="wrap">
              {[3, 6, 12, 18].map((months) => {
                const isActive = model.appSettings.activeStatusMonths === months
                return (
                  <OptionChip
                    key={months}
                    active={isActive}
                    onPress={() => model.setAppSettings({ activeStatusMonths: months })}
                  >
                    <OptionChipLabel active={isActive}>{months} mo</OptionChipLabel>
                  </OptionChip>
                )
              })}
            </XStack>
            <XStack items="center" justify="space-between">
              <YStack gap="$0.5" flex={1} pr="$3">
                <XStack items="center" gap="$2">
                  <Text fontSize={13}>Client list indicator</Text>
                  <SettingsInfoButton
                    title="Client list indicator"
                    message="Show Active/Inactive status on the Clients list."
                    onShowInfo={model.showInfo}
                  />
                </XStack>
                <Text fontSize={11} color="$textSecondary">
                  Show status labels on the client list.
                </Text>
              </YStack>
              <ThemedSwitch
                size="$2"
                checked={model.appSettings.clientsShowStatusList}
                onCheckedChange={(checked) =>
                  model.setAppSettings({
                    clientsShowStatusList: Boolean(checked),
                  })
                }
              />
            </XStack>
            <XStack items="center" justify="space-between">
              <YStack gap="$0.5" flex={1} pr="$3">
                <XStack items="center" gap="$2">
                  <Text fontSize={13}>Client details indicator</Text>
                  <SettingsInfoButton
                    title="Client details indicator"
                    message="Show Active/Inactive status on the client details screen."
                    onShowInfo={model.showInfo}
                  />
                </XStack>
                <Text fontSize={11} color="$textSecondary">
                  Show status labels on client detail pages.
                </Text>
              </YStack>
              <ThemedSwitch
                size="$2"
                checked={model.appSettings.clientsShowStatusDetails}
                onCheckedChange={(checked) =>
                  model.setAppSettings({
                    clientsShowStatusDetails: Boolean(checked),
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
