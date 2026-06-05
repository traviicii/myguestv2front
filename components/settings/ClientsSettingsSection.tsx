import { Text, XStack, YStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  FieldLabel,
  GhostButton,
  SecondaryButton,
  SurfaceCard,
  TextField,
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

      <SurfaceCard mode="section" tone={model.cardTone}>
        <XStack items="center" justify="space-between">
          <YStack gap="$0.5" flex={1} pr="$3">
            <XStack items="center" gap="$2">
              <Text fontSize={13}>Client groups</Text>
              <SettingsInfoButton
                title="Client groups"
                message="Create flexible groups like Color, Extensions, VIP, or Blowouts. Groups can be attached to any client and used to filter the client list."
                onShowInfo={model.showInfo}
              />
            </XStack>
            <Text fontSize={11} color="$textSecondary">
              Manage the labels available when adding or editing clients.
            </Text>
          </YStack>
        </XStack>

        <YStack gap="$3">
          <YStack gap="$2">
            <FieldLabel>Active groups</FieldLabel>
            {model.activeClientGroups.length ? (
              <YStack gap="$2">
                {model.activeClientGroups.map((group) => (
                  <YStack
                    key={group.id}
                    gap="$1.5"
                    p="$3"
                    rounded="$3"
                    borderWidth={1}
                    borderColor="$borderSubtle"
                    bg="$surfaceField"
                  >
                    <XStack gap="$2" items="center">
                      <TextField
                        flex={1}
                        value={model.clientGroupRenameDrafts[group.id] ?? group.name}
                        returnKeyType="done"
                        onChangeText={(value) =>
                          model.handleClientGroupRenameDraftChange(group.id, value)
                        }
                        onBlur={() => {
                          void model.handleSaveClientGroupRename(group.id)
                        }}
                        onSubmitEditing={() => {
                          void model.handleSaveClientGroupRename(group.id)
                        }}
                      />
                      <GhostButton
                        chromeless
                        onPress={() => {
                          void model.handleArchiveClientGroup(group.id)
                        }}
                      >
                        Archive
                      </GhostButton>
                    </XStack>
                    <Text fontSize={11} color="$textSecondary">
                      {group.clientCount} client{group.clientCount === 1 ? '' : 's'}
                    </Text>
                  </YStack>
                ))}
              </YStack>
            ) : (
              <Text fontSize={12} color="$textSecondary">
                No groups yet. Add your first group below.
              </Text>
            )}
          </YStack>

          <YStack gap="$2">
            <FieldLabel>Add group</FieldLabel>
            <XStack gap="$2" items="center">
              <TextField
                flex={1}
                placeholder="Extensions, VIP, Blowouts..."
                value={model.clientGroupDraft}
                returnKeyType="done"
                onChangeText={model.setClientGroupDraft}
                onSubmitEditing={() => {
                  void model.handleAddClientGroup()
                }}
              />
              <SecondaryButton
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
                    active={false}
                    onPress={() => {
                      void model.handleReactivateClientGroup(group.id)
                    }}
                  >
                    <OptionChipLabel active={false}>Restore {group.name}</OptionChipLabel>
                  </OptionChip>
                ))}
              </XStack>
            </YStack>
          ) : null}
        </YStack>
      </SurfaceCard>
    </SettingsSection>
  )
}
