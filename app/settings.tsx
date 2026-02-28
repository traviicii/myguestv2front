import { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  Alert,
  Platform,
  Pressable,
} from 'react-native'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  HelpCircle,
  Plus,
  RotateCcw,
} from '@tamagui/lucide-icons'
import {
  ScrollView,
  Text,
  XStack,
  YStack,
} from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  FieldLabel,
  OptionChip,
  OptionChipLabel,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  ThemedHeadingText,
  ThemedSwitch,
  TextField,
} from 'components/ui/controls'
import {
  useStudioStore,
  type AppointmentDateFormat,
  type OverviewSectionId,
} from 'components/state/studioStore'
import {
  useCreateService,
  useDeactivateService,
  useReactivateService,
  useServices,
  useUpdateService,
} from 'components/data/queries'
import { normalizeServiceName } from 'components/utils/services'

export default function SettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { appSettings, setAppSettings } = useStudioStore()
  const [serviceDraft, setServiceDraft] = useState('')
  const [renameDrafts, setRenameDrafts] = useState<Record<number, string>>({})
  const { data: serviceCatalog = [] } = useServices('all')
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deactivateService = useDeactivateService()
  const reactivateService = useReactivateService()
  const activeServices = useMemo(
    () =>
      serviceCatalog
        .filter((service) => service.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [serviceCatalog]
  )
  const inactiveServices = useMemo(
    () =>
      serviceCatalog
        .filter((service) => !service.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [serviceCatalog]
  )
  const canAddService = Boolean(normalizeServiceName(serviceDraft))

  const appointmentDateOptions: Array<{ id: AppointmentDateFormat; label: string }> = [
    { id: 'short', label: 'MM/DD/YYYY' },
    { id: 'long', label: 'Long format' },
  ]

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
      <HelpCircle size={14} color="$textSecondary" />
    </Pressable>
  )

  const handleAddService = async () => {
    const normalized = normalizeServiceName(serviceDraft)
    if (!normalized) return

    const alreadyExists = serviceCatalog.some(
      (service) => service.normalizedName === normalized.toLowerCase()
    )
    if (alreadyExists) {
      showInfo('Already listed', `${normalized} is already in your service list.`)
      return
    }

    try {
      await createService.mutateAsync({
        name: normalized,
        sortOrder: activeServices.length,
      })
      setServiceDraft('')
    } catch (error) {
      showInfo(
        'Unable to add service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleDeactivateService = async (serviceId: number) => {
    if (activeServices.length <= 1) {
      showInfo('At least one service', 'Keep at least one active service in the list.')
      return
    }

    try {
      await deactivateService.mutateAsync(serviceId)
    } catch (error) {
      showInfo(
        'Unable to remove service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleReactivateService = async (serviceId: number) => {
    try {
      await reactivateService.mutateAsync(serviceId)
      await updateService.mutateAsync({
        serviceId,
        sortOrder: activeServices.length,
      })
    } catch (error) {
      showInfo(
        'Unable to reactivate service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleRenameService = async (serviceId: number, currentName: string) => {
    const draft = renameDrafts[serviceId]
    if (draft === undefined) return

    const normalized = normalizeServiceName(draft)
    if (!normalized) {
      setRenameDrafts((prev) => ({ ...prev, [serviceId]: currentName }))
      return
    }
    if (normalized === currentName) {
      setRenameDrafts((prev) => {
        const next = { ...prev }
        delete next[serviceId]
        return next
      })
      return
    }

    try {
      await updateService.mutateAsync({
        serviceId,
        name: normalized,
      })
      setRenameDrafts((prev) => {
        const next = { ...prev }
        delete next[serviceId]
        return next
      })
    } catch (error) {
      showInfo(
        'Unable to rename service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleMoveService = async (serviceId: number, direction: 'up' | 'down') => {
    const ids = activeServices.map((service) => service.id)
    const currentIndex = ids.indexOf(serviceId)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= ids.length) return

    const nextOrder = [...ids]
    const [moved] = nextOrder.splice(currentIndex, 1)
    nextOrder.splice(targetIndex, 0, moved)

    try {
      for (let index = 0; index < nextOrder.length; index += 1) {
        const id = nextOrder[index]
        const current = activeServices.find((service) => service.id === id)
        if (!current || current.sortOrder === index) continue
        await updateService.mutateAsync({
          serviceId: id,
          sortOrder: index,
        })
      }
    } catch (error) {
      showInfo(
        'Unable to reorder services',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  return (
    <YStack flex={1} bg="$surfacePage" position="relative">
      <AmbientBackdrop />
      <XStack px="$5" pt={topInset} pb="$2" items="center" justify="space-between">
        <SecondaryButton
          size="$2"
          height={36}
          width={38}
          px="$2"
          icon={<ChevronLeft size={16} />}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <YStack width={38} />
      </XStack>
      <ScrollView contentContainerStyle={{ pb: '$10' }}>
        <YStack px="$5" pt="$3" gap="$4">
          <YStack gap="$2">
            <ThemedHeadingText fontWeight="700" fontSize={16}>
              App Settings
            </ThemedHeadingText>
            <Text fontSize={12} color="$textSecondary">
              Configure how the app behaves day to day.
            </Text>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <ThemedHeadingText fontWeight="700" fontSize={14}>
              Clients
            </ThemedHeadingText>
            <SurfaceCard mode="section">
              <XStack items="center" justify="space-between">
                <YStack gap="$0.5" flex={1} pr="$3">
                  <XStack items="center" gap="$2">
                    <Text fontSize={13}>Active/Inactive indicator</Text>
                    <InfoButton
                      title="Active/Inactive indicator"
                      message="Toggle status labels that show whether a client has visited recently."
                    />
                  </XStack>
                  <Text fontSize={11} color="$textSecondary">
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
              {appSettings.clientsShowStatus ? (
                <YStack gap="$2" pl="$3" borderLeftWidth={1} borderLeftColor="$borderSubtle">
                  <XStack items="center" justify="space-between">
                    <YStack gap="$0.5" flex={1} pr="$3">
                      <XStack items="center" gap="$2">
                        <Text fontSize={13}>Client list indicator</Text>
                        <InfoButton
                          title="Client list indicator"
                          message="Show Active/Inactive status on the Clients list."
                        />
                      </XStack>
                      <Text fontSize={11} color="$textSecondary">
                        Show status labels on the client list.
                      </Text>
                    </YStack>
                    <ThemedSwitch
                      size="$2"
                      checked={appSettings.clientsShowStatusList}
                      onCheckedChange={(checked) =>
                        setAppSettings({
                          clientsShowStatusList: Boolean(checked),
                        })
                      }
                    />
                  </XStack>
                  <XStack items="center" justify="space-between">
                    <YStack gap="$0.5" flex={1} pr="$3">
                      <XStack items="center" gap="$2">
                        <Text fontSize={13}>Client details indicator</Text>
                        <InfoButton
                          title="Client details indicator"
                          message="Show Active/Inactive status on the client details screen."
                        />
                      </XStack>
                      <Text fontSize={11} color="$textSecondary">
                        Show status labels on client detail pages.
                      </Text>
                    </YStack>
                    <ThemedSwitch
                      size="$2"
                      checked={appSettings.clientsShowStatusDetails}
                      onCheckedChange={(checked) =>
                        setAppSettings({
                          clientsShowStatusDetails: Boolean(checked),
                        })
                      }
                    />
                  </XStack>
                </YStack>
              ) : null}
              <XStack items="center" justify="space-between">
                <YStack gap="$0.5" flex={1} pr="$3">
                  <XStack items="center" gap="$2">
                    <Text fontSize={13}>Active window</Text>
                    <InfoButton
                      title="Active window"
                      message="Choose how far back a visit counts as active."
                    />
                  </XStack>
                  <Text fontSize={11} color="$textSecondary">
                    Clients are active if they visited within this timeframe.
                  </Text>
                </YStack>
              </XStack>
              <XStack gap="$2" flexWrap="wrap">
                {[3, 6, 12, 18].map((months) => {
                  const isActive = appSettings.activeStatusMonths === months
                  return (
                    <OptionChip
                      key={months}
                      active={isActive}
                      onPress={() => setAppSettings({ activeStatusMonths: months })}
                    >
                      <OptionChipLabel active={isActive}>{months} mo</OptionChipLabel>
                    </OptionChip>
                  )
                })}
              </XStack>
            </SurfaceCard>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <ThemedHeadingText fontWeight="700" fontSize={14}>
              Dates
            </ThemedHeadingText>
            <SurfaceCard mode="section">
              <YStack gap="$2">
                <XStack items="center" justify="space-between">
                  <YStack gap="$0.5" flex={1} pr="$3">
                    <XStack items="center" gap="$2">
                      <Text fontSize={13}>Date format</Text>
                      <InfoButton
                        title="Date format"
                        message="Controls the app-wide date display style. Today is still shown as 'Today'."
                      />
                    </XStack>
                    <Text fontSize={11} color="$textSecondary">
                      Applies globally, with compact cards kept short for readability.
                    </Text>
                  </YStack>
                </XStack>
                <XStack gap="$2" flexWrap="wrap">
                  {appointmentDateOptions.map((option) => {
                    const isActive = appSettings.dateDisplayFormat === option.id
                    return (
                      <OptionChip
                        key={option.id}
                        active={isActive}
                        onPress={() =>
                          setAppSettings({
                            dateDisplayFormat: option.id,
                          })
                        }
                      >
                        <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                      </OptionChip>
                    )
                  })}
                </XStack>
              </YStack>
              {appSettings.dateDisplayFormat === 'long' ? (
                <YStack gap="$2" pl="$3" borderLeftWidth={1} borderLeftColor="$borderSubtle">
                  <XStack items="center" justify="space-between">
                    <YStack gap="$0.5" flex={1} pr="$3">
                      <XStack items="center" gap="$2">
                        <Text fontSize={13}>Include weekday</Text>
                        <InfoButton
                          title="Include weekday"
                          message="When long format is enabled, include the weekday in dates."
                        />
                      </XStack>
                      <Text fontSize={11} color="$textSecondary">
                        Example: Monday, October 4th 2026
                      </Text>
                    </YStack>
                    <ThemedSwitch
                      size="$2"
                      checked={appSettings.dateLongIncludeWeekday}
                      onCheckedChange={(checked) =>
                        setAppSettings({
                          dateLongIncludeWeekday: Boolean(checked),
                        })
                      }
                    />
                  </XStack>
                </YStack>
              ) : null}
            </SurfaceCard>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <ThemedHeadingText fontWeight="700" fontSize={14}>
              Appointment Logs
            </ThemedHeadingText>
            <SurfaceCard mode="section">
              <XStack items="center" justify="space-between">
                <YStack gap="$0.5" flex={1} pr="$3">
                  <XStack items="center" gap="$2">
                    <Text fontSize={13}>Service dropdown options</Text>
                    <InfoButton
                      title="Service dropdown options"
                      message="Controls the selectable services shown when creating or editing an appointment log."
                    />
                  </XStack>
                  <Text fontSize={11} color="$textSecondary">
                    Names are formatted automatically (example: balayage → Balayage).
                  </Text>
                </YStack>
              </XStack>

              <YStack gap="$2">
                <FieldLabel>Active services</FieldLabel>
                {activeServices.map((service, index) => (
                  <XStack
                    key={service.id}
                    items="center"
                    gap="$2"
                    borderWidth={1}
                    borderColor="$borderSubtle"
                    rounded="$4"
                    p="$2"
                  >
                    <TextField
                      flex={1}
                      value={renameDrafts[service.id] ?? service.name}
                      onChangeText={(text) =>
                        setRenameDrafts((prev) => ({
                          ...prev,
                          [service.id]: text,
                        }))
                      }
                      onBlur={() => {
                        void handleRenameService(service.id, service.name)
                      }}
                    />
                    <SecondaryButton
                      size="$2"
                      px="$2"
                      icon={<ArrowUp size={14} />}
                      disabled={index === 0}
                      opacity={index === 0 ? 0.45 : 1}
                      onPress={() => {
                        void handleMoveService(service.id, 'up')
                      }}
                    />
                    <SecondaryButton
                      size="$2"
                      px="$2"
                      icon={<ArrowDown size={14} />}
                      disabled={index === activeServices.length - 1}
                      opacity={index === activeServices.length - 1 ? 0.45 : 1}
                      onPress={() => {
                        void handleMoveService(service.id, 'down')
                      }}
                    />
                    <SecondaryButton
                      size="$2"
                      px="$2"
                      onPress={() => {
                        void handleDeactivateService(service.id)
                      }}
                    >
                      Remove
                    </SecondaryButton>
                  </XStack>
                ))}
              </YStack>

              {inactiveServices.length ? (
                <YStack gap="$2">
                  <FieldLabel>Inactive services</FieldLabel>
                  <YStack gap="$1.5">
                    {inactiveServices.map((service) => (
                      <XStack
                        key={service.id}
                        items="center"
                        justify="space-between"
                        borderWidth={1}
                        borderColor="$borderSubtle"
                        rounded="$4"
                        p="$2.5"
                      >
                        <Text fontSize={12} color="$textSecondary">
                          {service.name}
                        </Text>
                        <SecondaryButton
                          size="$2"
                          icon={<RotateCcw size={14} />}
                          onPress={() => {
                            void handleReactivateService(service.id)
                          }}
                        >
                          Reactivate
                        </SecondaryButton>
                      </XStack>
                    ))}
                  </YStack>
                </YStack>
              ) : null}

              <YStack gap="$2">
                <FieldLabel>Add service</FieldLabel>
                <XStack gap="$2">
                  <TextField
                    flex={1}
                    placeholder="ex: single process"
                    value={serviceDraft}
                    onChangeText={setServiceDraft}
                    onBlur={() => {
                      setServiceDraft((current) => normalizeServiceName(current))
                    }}
                    onSubmitEditing={() => {
                      void handleAddService()
                    }}
                    returnKeyType="done"
                  />
                  <PrimaryButton
                    icon={<Plus size={14} />}
                    disabled={!canAddService || createService.isPending}
                    onPress={() => {
                      void handleAddService()
                    }}
                    opacity={canAddService && !createService.isPending ? 1 : 0.5}
                  >
                    {createService.isPending ? 'Adding...' : 'Add'}
                  </PrimaryButton>
                </XStack>
              </YStack>
            </SurfaceCard>
          </YStack>

          <SectionDivider />

          <YStack gap="$3">
            <ThemedHeadingText fontWeight="700" fontSize={14}>
              Overview
            </ThemedHeadingText>
            <SurfaceCard mode="section">
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
            </SurfaceCard>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
