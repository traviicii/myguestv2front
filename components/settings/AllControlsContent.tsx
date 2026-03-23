import { Link } from 'expo-router'
import { Trash2 } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  SecondaryButton,
  SurfaceCard,
  ThemedHeadingText,
  ThemedSwitch,
} from 'components/ui/controls'

import { ActiveServicesSection } from './appointmentLogs/ActiveServicesSection'
import { AddServiceSection } from './appointmentLogs/AddServiceSection'
import { InactiveServicesSection } from './appointmentLogs/InactiveServicesSection'
import { SettingsInfoButton } from './sectionPrimitives'
import type { SettingsScreenModel } from './useSettingsScreenModel'

export type AllControlsSectionId =
  | 'client-display'
  | 'overview-insights'
  | 'services-logs'
  | 'dates-formatting'
  | 'account-privacy'

export function AllControlsContent({
  captureSection,
  model,
}: {
  captureSection: (sectionId: AllControlsSectionId, y: number) => void
  model: SettingsScreenModel
}) {
  return (
    <YStack px="$5" pt="$3" gap="$5">
      <YStack gap="$2">
        <ThemedHeadingText fontWeight="700" fontSize={18}>
          All Controls
        </ThemedHeadingText>
        <Text fontSize={12} color="$textSecondary">
          Tune client visibility, overview insights, services, dates, and account
          safeguards from one place.
        </Text>
      </YStack>

      <YStack gap="$3" onLayout={(event) => captureSection('client-display', event.nativeEvent.layout.y)}>
        <ThemedHeadingText fontWeight="700" fontSize={15}>
          Client Display
        </ThemedHeadingText>
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
                Controls whether client status appears throughout the app.
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
            <YStack gap="$3" pl="$3" borderLeftWidth={1} borderLeftColor="$borderSubtle">
              <YStack gap="$2">
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
              </YStack>

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
                    Status on the main client index.
                  </Text>
                </YStack>
                <ThemedSwitch
                  size="$2"
                  checked={model.appSettings.clientsShowStatusList}
                  onCheckedChange={(checked) =>
                    model.setAppSettings({ clientsShowStatusList: Boolean(checked) })
                  }
                />
              </XStack>

              <XStack items="center" justify="space-between">
                <YStack gap="$0.5" flex={1} pr="$3">
                  <XStack items="center" gap="$2">
                    <Text fontSize={13}>Client details indicator</Text>
                    <SettingsInfoButton
                      title="Client details indicator"
                      message="Show Active/Inactive status on client detail screens."
                      onShowInfo={model.showInfo}
                    />
                  </XStack>
                  <Text fontSize={11} color="$textSecondary">
                    Status inside each client profile.
                  </Text>
                </YStack>
                <ThemedSwitch
                  size="$2"
                  checked={model.appSettings.clientsShowStatusDetails}
                  onCheckedChange={(checked) =>
                    model.setAppSettings({ clientsShowStatusDetails: Boolean(checked) })
                  }
                />
              </XStack>
            </YStack>
          ) : null}
        </SurfaceCard>
      </YStack>

      <YStack gap="$3" onLayout={(event) => captureSection('overview-insights', event.nativeEvent.layout.y)}>
        <ThemedHeadingText fontWeight="700" fontSize={15}>
          Overview Layout & Insights
        </ThemedHeadingText>
        <SurfaceCard mode="section" tone={model.cardTone}>
          <YStack gap="$3">
            <YStack gap="$1">
              <Text fontSize={13} fontWeight="600" color="$textPrimary">
                Visible sections
              </Text>
              <Text fontSize={11} color="$textSecondary">
                Decide which overview blocks appear on the main dashboard.
              </Text>
            </YStack>
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
          </YStack>

          <YStack gap="$3" mt="$2">
            <YStack gap="$1">
              <Text fontSize={13} fontWeight="600" color="$textPrimary">
                Preview counts
              </Text>
              <Text fontSize={11} color="$textSecondary">
                Control how many items preview at once before a user taps through.
              </Text>
            </YStack>
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
                    disabled={row.value <= 1}
                    opacity={row.value <= 1 ? 0.45 : 1}
                    onPress={() => model.updatePreviewCount(row.id, -1)}
                  >
                    –
                  </SecondaryButton>
                  <YStack width={30} items="center">
                    <Text fontSize={13} fontWeight="700">
                      {row.value}
                    </Text>
                  </YStack>
                  <SecondaryButton
                    size="$2"
                    px="$2"
                    disabled={row.value >= 12}
                    opacity={row.value >= 12 ? 0.45 : 1}
                    onPress={() => model.updatePreviewCount(row.id, 1)}
                  >
                    +
                  </SecondaryButton>
                </XStack>
              </XStack>
            ))}
          </YStack>

          <YStack gap="$3" mt="$2">
            <YStack gap="$1">
              <Text fontSize={13} fontWeight="600" color="$textPrimary">
                Insight rules
              </Text>
              <Text fontSize={11} color="$textSecondary">
                Tell metrics how far back they should look when calculating insights.
              </Text>
            </YStack>

            <YStack gap="$2">
              <XStack items="center" gap="$2">
                <Text fontSize={13}>Average ticket range</Text>
                <SettingsInfoButton
                  title="Average ticket range"
                  message="Choose the time window used when calculating average ticket."
                  onShowInfo={model.showInfo}
                />
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

            <YStack gap="$2">
              <XStack items="center" gap="$2">
                <Text fontSize={13}>Photo coverage range</Text>
                <SettingsInfoButton
                  title="Photo coverage range"
                  message="Choose the date range used to calculate photo coverage for appointment logs."
                  onShowInfo={model.showInfo}
                />
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
          </YStack>
        </SurfaceCard>
      </YStack>

      <YStack gap="$3" onLayout={(event) => captureSection('services-logs', event.nativeEvent.layout.y)}>
        <ThemedHeadingText fontWeight="700" fontSize={15}>
          Services & Appointment Logs
        </ThemedHeadingText>
        <SurfaceCard mode="section" tone={model.cardTone}>
          <YStack gap="$1">
            <Text fontSize={13} fontWeight="600" color="$textPrimary">
              Service catalog
            </Text>
            <Text fontSize={11} color="$textSecondary">
              Control the services available when creating or editing appointment logs.
            </Text>
          </YStack>
          <ActiveServicesSection model={model} />
          <InactiveServicesSection model={model} />
          <AddServiceSection model={model} />
        </SurfaceCard>
      </YStack>

      <YStack gap="$3" onLayout={(event) => captureSection('dates-formatting', event.nativeEvent.layout.y)}>
        <ThemedHeadingText fontWeight="700" fontSize={15}>
          Dates & Formatting
        </ThemedHeadingText>
        <SurfaceCard mode="section" tone={model.cardTone}>
          <YStack gap="$2">
            <XStack items="center" gap="$2">
              <Text fontSize={13}>Date format</Text>
              <SettingsInfoButton
                title="Date format"
                message="Controls the app-wide date display style. Today is still shown as 'Today'."
                onShowInfo={model.showInfo}
              />
            </XStack>
            <Text fontSize={11} color="$textSecondary">
              Applies globally so appointments and previews stay consistent.
            </Text>
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
                    model.setAppSettings({ dateLongIncludeWeekday: Boolean(checked) })
                  }
                />
              </XStack>
            </YStack>
          ) : null}
        </SurfaceCard>
      </YStack>

      <YStack gap="$3" onLayout={(event) => captureSection('account-privacy', event.nativeEvent.layout.y)}>
        <ThemedHeadingText fontWeight="700" fontSize={15}>
          Account & Privacy
        </ThemedHeadingText>
        <SurfaceCard mode="section" tone={model.cardTone}>
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
        </SurfaceCard>
      </YStack>
    </YStack>
  )
}
