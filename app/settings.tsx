import { Alert, Platform, Pressable } from 'react-native'
import { HelpCircle } from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { SectionDivider, ThemedSwitch } from 'components/ui/controls'
import { useStudioStore, type OverviewSectionId } from 'components/state/studioStore'

const cardBorder = {
  bg: '$gray1',
  borderWidth: 1,
  borderColor: '$gray3',
  shadowColor: 'rgba(15,23,42,0.08)',
  shadowRadius: 18,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
}

export default function SettingsScreen() {
  const { appSettings, setAppSettings } = useStudioStore()

  const showInfo = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(`${title}\n\n${message}`)
      }
      return
    }
    Alert.alert(title, message)
  }

  const InfoButton = ({ title, message }: { title: string; message: string }) => (
    // Lightweight inline help pattern shared by settings rows.
    <Pressable
      onPress={() => showInfo(title, message)}
      style={{ paddingHorizontal: 4, paddingVertical: 2 }}
      hitSlop={6}
    >
      <HelpCircle size={14} color="#94A3B8" />
    </Pressable>
  )

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontFamily="$heading" fontWeight="600" fontSize={16} color="$color">
              App Settings
            </Text>
            <Text fontSize={12} color="$gray8">
              Configure how the app behaves day to day.
            </Text>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Client list
            </Text>
            <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
              <XStack items="center" justify="space-between">
                <YStack gap="$0.5" flex={1} pr="$3">
                  <XStack items="center" gap="$2">
                    <Text fontSize={13}>Active/Inactive indicator</Text>
                    <InfoButton
                      title="Active/Inactive indicator"
                      message="Shows whether a client has visited in the past year on the client list."
                    />
                  </XStack>
                  <Text fontSize={11} color="$gray8">
                    Show client status labels in the list.
                  </Text>
                </YStack>
                <ThemedSwitch
                  size="$2"
                  checked={appSettings.clientsShowStatus}
                  onCheckedChange={(checked) =>
                    setAppSettings({ clientsShowStatus: Boolean(checked) })
                  }
                />
              </XStack>
              <XStack items="center" justify="space-between">
                <YStack gap="$0.5" flex={1} pr="$3">
                  <XStack items="center" gap="$2">
                    <Text fontSize={13}>Active window</Text>
                    <InfoButton
                      title="Active window"
                      message="Choose how far back a visit counts as active."
                    />
                  </XStack>
                  <Text fontSize={11} color="$gray8">
                    Clients are active if they visited within this timeframe.
                  </Text>
                </YStack>
              </XStack>
              <XStack gap="$2" flexWrap="wrap">
                {[3, 6, 12, 18].map((months) => {
                  const isActive = appSettings.activeStatusMonths === months
                  return (
                    <XStack
                      key={months}
                      {...cardBorder}
                      rounded="$3"
                      px="$2.5"
                      py="$1.5"
                      items="center"
                      bg={isActive ? '$accentMuted' : '$background'}
                      borderColor={isActive ? '$accentSoft' : '$borderColor'}
                      onPress={() =>
                        setAppSettings({ activeStatusMonths: months })
                      }
                    >
                      <Text fontSize={11} color={isActive ? '$accent' : '$gray8'}>
                        {months} mo
                      </Text>
                    </XStack>
                  )
                })}
              </XStack>
            </YStack>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Overview
            </Text>
            <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
              {(
                [
                  {
                    id: 'quickActions',
                    label: 'Quick Actions',
                    help: 'Show the quick action buttons at the top of Overview.',
                  },
                  {
                    id: 'metrics',
                    label: 'Metrics',
                    help: 'Show the metrics tiles section.',
                  },
                  {
                    id: 'recentAppointments',
                    label: 'Recent Appointments',
                    help: 'Show the most recent appointment logs.',
                  },
                  {
                    id: 'recentClients',
                    label: 'Recent Clients',
                    help: 'Show recently added or visited clients.',
                  },
                  {
                    id: 'pinnedClients',
                    label: 'Pinned Clients',
                    help: 'Show your pinned client list on Overview.',
                  },
                ] as const satisfies ReadonlyArray<{
                  id: OverviewSectionId
                  label: string
                  help: string
                }>
              ).map((section) => (
                <XStack key={section.id} items="center" justify="space-between">
                  <XStack items="center" gap="$2" flex={1} pr="$3">
                    <Text fontSize={13}>{section.label}</Text>
                    <InfoButton title={section.label} message={section.help} />
                  </XStack>
                  <ThemedSwitch
                    size="$2"
                    checked={appSettings.overviewSections[section.id]}
                    onCheckedChange={(checked) =>
                      setAppSettings({
                        overviewSections: {
                          ...appSettings.overviewSections,
                          [section.id]: Boolean(checked),
                        },
                      })
                    }
                  />
                </XStack>
              ))}
            </YStack>
          </YStack>

        </YStack>
      </ScrollView>
    </YStack>
  )
}
