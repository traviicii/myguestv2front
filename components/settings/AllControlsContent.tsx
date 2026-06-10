import type { ReactNode } from 'react'
import { type Href, useRouter } from 'expo-router'
import {
  Archive,
  BarChart3,
  CalendarDays,
  Scissors,
  Users,
} from '@tamagui/lucide-icons'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import {
  InsetGroup,
  InsetRow,
  InsetSectionFooter,
  InsetSectionHeader,
  FieldLabel,
  GhostButton,
  OptionChip,
  OptionChipLabel,
  SecondaryButton,
  TextField,
  ThemedHeadingText,
  ThemedSwitch,
} from 'components/ui/controls'
import { impactLightHaptic, selectionHaptic } from 'components/utils/haptics'

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

const SETTINGS_SECTIONS: AllControlsSectionId[] = [
  'client-display',
  'overview-insights',
  'services-logs',
  'dates-formatting',
]

export function isAllControlsSectionId(
  value: string | string[] | undefined
): value is AllControlsSectionId {
  if (typeof value !== 'string') return false
  return SETTINGS_SECTIONS.includes(value as AllControlsSectionId)
}

export function getSettingsSectionTitle(sectionId: AllControlsSectionId) {
  if (sectionId === 'client-display') return 'Client Display'
  if (sectionId === 'overview-insights') return 'Overview & Insights'
  if (sectionId === 'services-logs') return 'Services & Appointment Logs'
  return 'Dates & Formatting'
}

function getSettingsSectionIntro(sectionId: AllControlsSectionId) {
  if (sectionId === 'client-display') {
    return 'Set activity labels and choose where they appear.'
  }
  if (sectionId === 'overview-insights') {
    return 'Choose the Overview sections, item limits, and metric ranges that matter most.'
  }
  if (sectionId === 'services-logs') {
    return 'Manage services used in appointment logs, including optional default price and return timing.'
  }
  if (sectionId === 'dates-formatting') {
    return 'Choose how dates appear across appointments, previews, and client history.'
  }
  return ''
}

export function getSettingsSectionHref(sectionId: AllControlsSectionId): Href {
  return `/settings/${sectionId}` as Href
}

function SettingsSectionPageHeader({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <YStack gap="$2">
      <ThemedHeadingText fontWeight="700" fontSize={18}>
        {title}
      </ThemedHeadingText>
      <Text fontSize={12} color="$textSecondary">
        {body}
      </Text>
    </YStack>
  )
}

function ClientDisplayDetail({ model }: { model: SettingsScreenModel }) {
  const updateSettings = (patch: Partial<typeof model.appSettings>) => {
    void selectionHaptic()
    model.setAppSettings(patch)
  }

  return (
    <YStack gap="$4">
      <YStack
        gap="$2.5"
        onLayout={(event) => {
          model.handleClientGroupsSectionLayout(event.nativeEvent.layout.y)
        }}
      >
        <InsetSectionHeader
          title="Client status"
          subtitle="Set how activity labels appear across client surfaces."
        />
        <InsetGroup>
          <InsetRow
            title="Show active and inactive indicators"
            subtitle="Display activity status on selected client views."
            showChevron={false}
            trailing={
              <ThemedSwitch
                size="$2"
                checked={model.appSettings.clientsShowStatus}
                onCheckedChange={(checked) =>
                  updateSettings({ clientsShowStatus: Boolean(checked) })
                }
              />
            }
          />
        </InsetGroup>
      </YStack>

      {model.appSettings.clientsShowStatus ? (
        <>
          <YStack gap="$2.5">
            <InsetSectionHeader
              title="Active window"
              subtitle="Mark clients active when their last visit falls within this timeframe."
            />
            <InsetGroup>
              <XStack px="$4" py="$4" gap="$2" flexWrap="wrap">
                {[3, 6, 12, 18].map((months) => {
                  const isActive = model.appSettings.activeStatusMonths === months
                  return (
                    <OptionChip
                      key={months}
                      active={isActive}
                      onPress={() => updateSettings({ activeStatusMonths: months })}
                    >
                      <OptionChipLabel active={isActive}>{months} mo</OptionChipLabel>
                    </OptionChip>
                  )
                })}
              </XStack>
            </InsetGroup>
          </YStack>

          <YStack gap="$2.5">
            <InsetSectionHeader
              title="Where status appears"
              subtitle="Choose where activity labels are visible."
            />
            <InsetGroup>
              <InsetRow
                title="Client list"
                subtitle="Show activity status in the client index."
                showChevron={false}
                trailing={
                  <ThemedSwitch
                    size="$2"
                    checked={model.appSettings.clientsShowStatusList}
                    onCheckedChange={(checked) =>
                      updateSettings({ clientsShowStatusList: Boolean(checked) })
                    }
                  />
                }
              />
              <InsetRow
                title="Client details"
                subtitle="Show activity status on client profiles."
                showChevron={false}
                showSeparator={false}
                trailing={
                  <ThemedSwitch
                    size="$2"
                    checked={model.appSettings.clientsShowStatusDetails}
                    onCheckedChange={(checked) =>
                      updateSettings({ clientsShowStatusDetails: Boolean(checked) })
                    }
                  />
                }
              />
            </InsetGroup>
          </YStack>
        </>
      ) : null}

      <YStack gap="$2.5">
        <InsetSectionHeader
          title="Client groups"
          subtitle="Manage flexible groups like Color, Extensions, VIP, or Blowouts."
        />
        <InsetGroup>
          <YStack px="$4" py="$4" gap="$4">
            <YStack gap="$2">
              <FieldLabel>Active groups</FieldLabel>
              {model.activeClientGroups.length ? (
                <YStack
                  gap="$0"
                  onLayout={(event) => {
                    model.handleActiveClientGroupsListLayout(event.nativeEvent.layout.y)
                  }}
                >
                  {model.activeClientGroups.map((group, index) => {
                    const fieldId = `client-group:${group.id}` as const
                    return (
                      <XStack
                        key={group.id}
                        testID={`settings-client-group-card-${group.normalizedName}`}
                        items="center"
                        gap="$2.5"
                        py="$2"
                        borderBottomWidth={
                          index < model.activeClientGroups.length - 1 ? 1 : 0
                        }
                        borderBottomColor="$divider"
                        onLayout={(event) => {
                          model.handleClientGroupCardLayout(group.id, event.nativeEvent.layout.y)
                        }}
                      >
                        <YStack flex={1} minW={0} gap="$1">
                          <TextField
                            ref={model.setClientGroupInputRef(fieldId)}
                            testID={`settings-client-group-rename-${group.normalizedName}`}
                            height={38}
                            fontSize={13}
                            value={model.clientGroupRenameDrafts[group.id] ?? group.name}
                            inputAccessoryViewID={model.keyboardAccessoryId}
                            returnKeyType={model.getClientGroupFieldReturnKeyType(fieldId)}
                            blurOnSubmit={false}
                            onLayout={(event) => {
                              model.handleClientGroupFieldLayout(
                                fieldId,
                                event.nativeEvent.layout.y
                              )
                            }}
                            onFocus={() => model.handleClientGroupFieldFocus(fieldId)}
                            onChangeText={(value) =>
                              model.handleClientGroupRenameDraftChange(group.id, value)
                            }
                            onBlur={() => {
                              void model.handleSaveClientGroupRename(group.id)
                            }}
                            onSubmitEditing={() => {
                              void model.handleSaveClientGroupRename(group.id)
                              model.handleClientGroupFieldSubmit(fieldId)
                            }}
                          />
                          <Text fontSize={11} color="$textSecondary">
                            {group.clientCount} client{group.clientCount === 1 ? '' : 's'}
                          </Text>
                        </YStack>
                        <SecondaryButton
                          testID={`settings-client-group-archive-${group.normalizedName}`}
                          size="$2"
                          width={36}
                          height={36}
                          minW={36}
                          px="$0"
                          icon={<Archive size={14} />}
                          accessibilityLabel={`Archive ${group.name}`}
                          onPress={() => {
                            void model.handleArchiveClientGroup(group.id)
                          }}
                        />
                      </XStack>
                    )
                  })}
                </YStack>
              ) : (
                <Text fontSize={12} color="$textSecondary">
                  No groups yet. Add your first group below.
                </Text>
              )}
            </YStack>

            <YStack gap="$2">
              <FieldLabel>Add group</FieldLabel>
              <XStack
                gap="$2"
                items="center"
                onLayout={(event) => {
                  model.handleAddClientGroupRowLayout(event.nativeEvent.layout.y)
                }}
              >
                <TextField
                  ref={model.setClientGroupInputRef('new-client-group')}
                  testID="settings-client-group-add-input"
                  flex={1}
                  placeholder="Extensions, VIP, Blowouts..."
                  value={model.clientGroupDraft}
                  inputAccessoryViewID={model.keyboardAccessoryId}
                  returnKeyType={model.getClientGroupFieldReturnKeyType('new-client-group')}
                  onLayout={(event) => {
                    model.handleClientGroupFieldLayout(
                      'new-client-group',
                      event.nativeEvent.layout.y
                    )
                  }}
                  onFocus={() => model.handleClientGroupFieldFocus('new-client-group')}
                  onChangeText={model.setClientGroupDraft}
                  onSubmitEditing={() => {
                    void model.handleAddClientGroup()
                  }}
                />
                <SecondaryButton
                  testID="settings-client-group-add-button"
                  disabled={!model.canAddClientGroup || model.createClientGroup.isPending}
                  opacity={
                    model.canAddClientGroup && !model.createClientGroup.isPending ? 1 : 0.5
                  }
                  onPress={() => {
                    void model.handleAddClientGroup()
                  }}
                >
                  Add
                </SecondaryButton>
              </XStack>
            </YStack>

            {model.archivedClientGroups.length ? (
              <YStack gap="$2">
                <FieldLabel>Archived groups</FieldLabel>
                <XStack gap="$2" flexWrap="wrap">
                  {model.archivedClientGroups.map((group) => (
                    <OptionChip
                      key={group.id}
                      testID={`settings-client-group-restore-${group.normalizedName}`}
                      active={false}
                      onPress={() => {
                        void model.handleReactivateClientGroup(group.id)
                      }}
                    >
                      <OptionChipLabel active={false}>
                        Restore {group.name}
                      </OptionChipLabel>
                    </OptionChip>
                  ))}
                </XStack>
              </YStack>
            ) : null}
          </YStack>
        </InsetGroup>
        <InsetSectionFooter>
          Groups can be assigned from Add Client or Edit Client and used in Clients filters.
        </InsetSectionFooter>
      </YStack>
    </YStack>
  )
}

function OverviewInsightsDetail({ model }: { model: SettingsScreenModel }) {
  const updateSettings = (patch: Partial<typeof model.appSettings>) => {
    void selectionHaptic()
    model.setAppSettings(patch)
  }

  return (
    <YStack gap="$4">
      <YStack gap="$2.5">
        <InsetSectionHeader
          title="Visible sections"
          subtitle="Choose which sections appear on Overview."
        />
        <InsetGroup>
          {model.overviewSectionOptions.map((section, index) => (
            <InsetRow
              key={section.id}
              title={section.label}
              subtitle={section.help}
              showChevron={false}
              showSeparator={index < model.overviewSectionOptions.length - 1}
              trailing={
                <ThemedSwitch
                  size="$2"
                  checked={model.appSettings.overviewSections[section.id]}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      overviewSections: {
                        ...model.appSettings.overviewSections,
                        [section.id]: Boolean(checked),
                      },
                    })
                  }
                />
              }
            />
          ))}
        </InsetGroup>
      </YStack>

      <YStack gap="$2.5">
        <InsetSectionHeader
          title="Preview counts"
          subtitle="Set how many items appear before a full list opens."
        />
        <InsetGroup>
          {model.displayRows.map((row, index) => (
            <InsetRow
              key={row.id}
              title={row.label}
              subtitle={`${row.value} ${row.value === 1 ? 'item' : 'items'} shown.`}
              showChevron={false}
              showSeparator={index < model.displayRows.length - 1}
              trailing={
                <XStack items="center" gap="$1.5">
                  <SecondaryButton
                    size="$2"
                    px="$2"
                    disabled={row.value <= 1}
                    opacity={row.value <= 1 ? 0.45 : 1}
                    onPress={() => {
                      void selectionHaptic()
                      model.updatePreviewCount(row.id, -1)
                    }}
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
                    onPress={() => {
                      void selectionHaptic()
                      model.updatePreviewCount(row.id, 1)
                    }}
                  >
                    +
                  </SecondaryButton>
                </XStack>
              }
            />
          ))}
        </InsetGroup>
      </YStack>

      <YStack gap="$2.5">
        <InsetSectionHeader
          title="Insight rules"
          subtitle="Set the date ranges used for calculated metrics."
        />
        <InsetGroup>
          <YStack px="$4" py="$4" gap="$3">
            <YStack gap="$2">
              <XStack items="center" gap="$2">
                <Text fontSize={13}>Average ticket range</Text>
                <SettingsInfoButton
                  title="Average ticket range"
                  message="Sets the appointment date range used for average ticket."
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
                      onPress={() => updateSettings({ avgTicketRange: option.id })}
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
                  message="Sets the appointment date range used for photo coverage."
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
                      onPress={() => updateSettings({ photoCoverageRange: option.id })}
                    >
                      <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                    </OptionChip>
                  )
                })}
              </XStack>
            </YStack>
          </YStack>
        </InsetGroup>
      </YStack>
    </YStack>
  )
}

function ServicesAppointmentLogsDetail({ model }: { model: SettingsScreenModel }) {
  const visibleServicesCopy = `${model.activeServices.length} active ${
    model.activeServices.length === 1 ? 'service' : 'services'
  }`
  const archivedServicesCopy = model.inactiveServices.length
    ? ` · ${model.inactiveServices.length} archived`
    : ''

  return (
    <YStack gap="$5">
      <InsetSectionHeader
        title="Service defaults"
        subtitle="Set the services available for appointment logs. Defaults can prefill new visits and still be edited."
      />
      <InsetSectionFooter>
        {visibleServicesCopy}
        {archivedServicesCopy}
      </InsetSectionFooter>

      <YStack gap="$4">
        <ActiveServicesSection model={model} />
        <AddServiceSection model={model} />
        <InactiveServicesSection model={model} />
      </YStack>
    </YStack>
  )
}

function DatesFormattingDetail({ model }: { model: SettingsScreenModel }) {
  const updateSettings = (patch: Partial<typeof model.appSettings>) => {
    void selectionHaptic()
    model.setAppSettings(patch)
  }

  return (
    <YStack gap="$4">
      <YStack gap="$2.5">
        <InsetSectionHeader
          title="Date format"
          subtitle="Use one date style across appointments, previews, and client history."
        />
        <InsetGroup>
          <YStack px="$4" py="$4" gap="$3">
            <XStack items="center" gap="$2">
              <Text fontSize={13}>Display style</Text>
              <SettingsInfoButton
                title="Date format"
                message="Sets the app-wide date style. Relative labels such as Today still appear when useful."
                onShowInfo={model.showInfo}
              />
            </XStack>
            <XStack gap="$2" flexWrap="wrap">
              {model.appointmentDateOptions.map((option) => {
                const isActive = model.appSettings.dateDisplayFormat === option.id
                return (
                  <OptionChip
                    key={option.id}
                    active={isActive}
                    onPress={() => updateSettings({ dateDisplayFormat: option.id })}
                  >
                    <OptionChipLabel active={isActive}>{option.label}</OptionChipLabel>
                  </OptionChip>
                )
              })}
            </XStack>
          </YStack>
        </InsetGroup>
      </YStack>

      {model.appSettings.dateDisplayFormat === 'long' ? (
        <YStack gap="$2.5">
          <InsetSectionHeader
            title="Long-format options"
            subtitle="Choose whether long dates include the weekday."
          />
          <InsetGroup>
            <InsetRow
              title="Include weekday"
              subtitle="Example: Monday, October 4th 2026"
              showChevron={false}
              showSeparator={false}
              trailing={
                <ThemedSwitch
                  size="$2"
                  checked={model.appSettings.dateLongIncludeWeekday}
                  onCheckedChange={(checked) =>
                    updateSettings({ dateLongIncludeWeekday: Boolean(checked) })
                  }
                />
              }
            />
          </InsetGroup>
        </YStack>
      ) : null}
    </YStack>
  )
}

function SettingsSectionBody({
  model,
  sectionId,
}: {
  model: SettingsScreenModel
  sectionId: AllControlsSectionId
}) {
  if (sectionId === 'client-display') {
    return <ClientDisplayDetail model={model} />
  }
  if (sectionId === 'overview-insights') {
    return <OverviewInsightsDetail model={model} />
  }
  if (sectionId === 'services-logs') {
    return <ServicesAppointmentLogsDetail model={model} />
  }
  if (sectionId === 'dates-formatting') {
    return <DatesFormattingDetail model={model} />
  }
  return null
}

export function SettingsSectionScreenContent({
  model,
  sectionId,
}: {
  model: SettingsScreenModel
  sectionId: AllControlsSectionId
}) {
  return (
    <YStack testID={`settings-screen-${sectionId}`} px="$5" pt="$3" gap="$5" pb="$10">
      <SettingsSectionPageHeader
        title={getSettingsSectionTitle(sectionId)}
        body={getSettingsSectionIntro(sectionId)}
      />
      <SettingsSectionBody model={model} sectionId={sectionId} />
    </YStack>
  )
}

export function AllControlsContent({ model }: { model: SettingsScreenModel }) {
  const router = useRouter()
  const rows = [
    {
      id: 'client-display' as const,
      title: 'Client Display',
      subtitle: `${model.clientDisplaySummary} · ${model.activeClientGroups.length} groups`,
      icon: <Users size={16} color="$accent" />,
    },
    {
      id: 'overview-insights' as const,
      title: 'Overview & Insights',
      subtitle: model.overviewInsightsSummary,
      icon: <BarChart3 size={16} color="$accent" />,
    },
    {
      id: 'services-logs' as const,
      title: 'Services & Appointment Logs',
      subtitle: model.servicesLogsSummary,
      icon: <Scissors size={16} color="$accent" />,
    },
    {
      id: 'dates-formatting' as const,
      title: 'Dates & Formatting',
      subtitle: model.datesFormattingSummary,
      icon: <CalendarDays size={16} color="$accent" />,
    },
  ]

  return (
    <YStack px="$5" pt="$3" gap="$5">
      <SettingsSectionPageHeader
        title="Settings"
        body="Adjust client display, Overview sections, appointment defaults, date formats, and client groups."
      />

      <YStack gap="$2.5">
        <InsetSectionHeader
          title="Categories"
          subtitle="Choose a category to review and update."
        />
        <InsetGroup>
          {rows.map((row, index) => (
            <InsetRow
              key={row.id}
              testID={`settings-row-${row.id}`}
              title={row.title}
              subtitle={row.subtitle}
              icon={row.icon}
              showSeparator={index < rows.length - 1}
              onPress={() => {
                void impactLightHaptic()
                router.push(getSettingsSectionHref(row.id))
              }}
            />
          ))}
        </InsetGroup>
        <InsetSectionFooter>
          Theme Preferences is separate so appearance changes can preview live.
        </InsetSectionFooter>
      </YStack>
    </YStack>
  )
}

export function SettingsSectionScrollContent({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack gap="$5" pb="$1">
        {children}
      </YStack>
    </ScrollView>
  )
}
