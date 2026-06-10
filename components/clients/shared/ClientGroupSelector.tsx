import { Check, Plus } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import type { ClientGroup } from 'components/data/models'
import {
  OptionChip,
  OptionChipLabel,
  SecondaryButton,
  TextField,
} from 'components/ui/controls'
import { normalizeClientGroupName } from 'components/utils/clientGroups'
import { selectionHaptic } from 'components/utils/haptics'

type ClientGroupSelectorProps = {
  canCreate?: boolean
  createDraft?: string
  createError?: string | null
  groups: ClientGroup[]
  isCreating?: boolean
  onCreate?: () => void
  onCreateDraftChange?: (value: string) => void
  onToggleGroup: (groupId: number) => void
  selectedGroupIds: number[]
}

export function ClientGroupSelector({
  canCreate = false,
  createDraft = '',
  createError = null,
  groups,
  isCreating = false,
  onCreate,
  onCreateDraftChange,
  onToggleGroup,
  selectedGroupIds,
}: ClientGroupSelectorProps) {
  const selectedIds = new Set(selectedGroupIds)
  const hasGroups = groups.length > 0
  const normalizedDraft = normalizeClientGroupName(createDraft)

  return (
    <YStack gap="$3">
      {hasGroups ? (
        <XStack gap="$2" flexWrap="wrap">
          {groups.map((group) => {
            const active = selectedIds.has(group.id)
            return (
              <OptionChip
                key={group.id}
                testID={`client-group-chip-${group.normalizedName}`}
                active={active}
                onPress={() => {
                  void selectionHaptic()
                  onToggleGroup(group.id)
                }}
              >
                <XStack items="center" gap="$1.5">
                  {active ? <Check size={13} color="$accent" /> : null}
                  <OptionChipLabel active={active}>{group.name}</OptionChipLabel>
                </XStack>
              </OptionChip>
            )
          })}
        </XStack>
      ) : (
        <Text fontSize={12} color="$textSecondary">
          No groups yet. Add one like Color, Extensions, VIP, or Blowouts.
        </Text>
      )}

      {canCreate ? (
        <YStack gap="$2">
          <XStack gap="$2" items="center">
            <TextField
              testID="client-group-create-input"
              flex={1}
              value={createDraft}
              placeholder="Add a group"
              returnKeyType="done"
              onChangeText={onCreateDraftChange}
              onSubmitEditing={() => {
                if (normalizedDraft && onCreate) {
                  onCreate()
                }
              }}
            />
            <SecondaryButton
              testID="client-group-create-button"
              px="$3"
              disabled={!normalizedDraft || isCreating}
              opacity={normalizedDraft && !isCreating ? 1 : 0.5}
              onPress={onCreate}
            >
              <XStack items="center" gap="$1.5">
                <Plus size={14} color="$color" />
                <Text fontSize={12} fontWeight="700">
                  Add
                </Text>
              </XStack>
            </SecondaryButton>
          </XStack>
          {createError ? (
            <Text fontSize={11} color="$red10">
              {createError}
            </Text>
          ) : null}
        </YStack>
      ) : null}
    </YStack>
  )
}
