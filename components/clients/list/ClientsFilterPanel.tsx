import { Search, X } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  GhostButton,
  IOSBottomSheet,
  InsetGroup,
  InsetSectionFooter,
  InsetSectionHeader,
  OptionChip,
  OptionChipLabel,
  PreviewCard,
  TextField,
  cardSurfaceProps,
} from 'components/ui/controls'
import { selectionHaptic } from 'components/utils/haptics'

import type { ClientsSectionProps } from './sectionTypes'

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const
const VISIT_FILTERS = ['All', 'Needs First Visit', 'Returning'] as const
const FOLLOW_UP_FILTERS = ['All', 'Overdue', 'Due This Week'] as const

function FilterChipGroup<T extends string>({
  activeValue,
  options,
  onSelect,
}: {
  activeValue: T
  onSelect: (value: T) => void
  options: readonly T[]
}) {
  return (
    <InsetGroup>
      <XStack px="$4" py="$4" gap="$2" flexWrap="wrap">
        {options.map((option) => (
          <OptionChip
            key={option}
            active={activeValue === option}
            onPress={() => {
              void selectionHaptic()
              onSelect(option)
            }}
          >
            <OptionChipLabel active={activeValue === option}>{option}</OptionChipLabel>
          </OptionChip>
        ))}
      </XStack>
    </InsetGroup>
  )
}

function GroupFilterChipGroup({
  activeValue,
  groups,
  onSelect,
}: {
  activeValue: string
  groups: ClientsSectionProps['model']['clientGroups']
  onSelect: (value: string) => void
}) {
  return (
    <InsetGroup>
      <XStack px="$4" py="$4" gap="$2" flexWrap="wrap">
        <OptionChip
          testID="clients-filter-group-all"
          active={activeValue === 'All'}
          onPress={() => {
            void selectionHaptic()
            onSelect('All')
          }}
        >
          <OptionChipLabel active={activeValue === 'All'}>All</OptionChipLabel>
        </OptionChip>
        {groups.map((group) => {
          const value = String(group.id)
          const active = activeValue === value
          return (
            <OptionChip
              key={group.id}
              testID={`clients-filter-group-${group.normalizedName}`}
              active={active}
              onPress={() => {
                void selectionHaptic()
                onSelect(value)
              }}
            >
              <OptionChipLabel active={active}>{group.name}</OptionChipLabel>
            </OptionChip>
          )
        })}
      </XStack>
    </InsetGroup>
  )
}

export function ClientsSearchBar({ model }: ClientsSectionProps) {
  return (
    <XStack gap="$3" items="center">
      <XStack
        {...cardSurfaceProps}
        flex={1}
        rounded={model.controlRadius}
        px="$3"
        py="$2"
        items="center"
        gap="$2"
      >
        <Search size={16} color="$textSecondary" />
        <TextField
          ref={model.searchInputRef}
          flex={1}
          borderWidth={0}
          height={36}
          px="$0"
          pl="$2"
          placeholder="Search clients, tags, notes"
          value={model.searchText}
          onChangeText={model.setSearchText}
          onSubmitEditing={model.handleSearchSubmit}
          returnKeyType="search"
          blurOnSubmit
          fontSize={12}
          color="$color"
          placeholderTextColor="$textMuted"
        />
        <XStack
          width={28}
          height={28}
          rounded={999}
          items="center"
          justify="center"
          onPress={model.handleClearSearch}
          pressStyle={model.searchText ? { opacity: 0.7 } : undefined}
          opacity={model.searchText ? 1 : 0.35}
          pointerEvents={model.searchText ? 'auto' : 'none'}
        >
          <X size={14} color="$textSecondary" />
        </XStack>
      </XStack>
    </XStack>
  )
}

export function ClientsFilterPanel({ model }: ClientsSectionProps) {
  return (
    <IOSBottomSheet
      open={model.filterSheetOpen && model.hasClients}
      onClose={model.closeFilterSheet}
      title="Filters"
      testID="clients-filter-sheet"
      leadingAction={
        <GhostButton
          testID="clients-filter-reset"
          onPress={() => {
            void selectionHaptic()
            model.resetFilterSelections()
          }}
        >
          Reset
        </GhostButton>
      }
    >
      <YStack gap="$4" pb="$1">
        <PreviewCard mode="section" tone="secondary" p="$3.5" gap="$1.5">
          <Text fontSize={13} fontWeight="700" color="$textPrimary">
            Refine your client list
          </Text>
          <Text fontSize={11} color="$textSecondary">
            Filter by activity, follow-up timing, visit history, client groups, and saved labels. Changes apply as soon as you tap.
          </Text>
          <Text fontSize={11} color="$accent">
            {model.activeFilterCount === 0
              ? 'No filters active'
              : `${model.activeFilterCount} filter${model.activeFilterCount === 1 ? '' : 's'} active`}
          </Text>
        </PreviewCard>

        <YStack gap="$2.5">
          <InsetSectionHeader
            title="Status"
            subtitle="Filter clients by whether they are currently considered active."
          />
          <FilterChipGroup
            activeValue={model.statusFilter}
            options={STATUS_FILTERS}
            onSelect={model.setStatusFilter}
          />
        </YStack>

        <YStack gap="$2.5">
          <InsetSectionHeader
            title="Follow-up Timing"
            subtitle="Find clients whose suggested return window is overdue or coming up this week."
          />
          <FilterChipGroup
            activeValue={model.followUpFilter}
            options={FOLLOW_UP_FILTERS}
            onSelect={model.setFollowUpFilter}
          />
        </YStack>

        <YStack gap="$2.5">
          <InsetSectionHeader
            title="Visit History"
            subtitle="Separate brand-new clients from returning guests."
          />
          <FilterChipGroup
            activeValue={model.visitFilter}
            options={VISIT_FILTERS}
            onSelect={model.setVisitFilter}
          />
        </YStack>

        <YStack gap="$2.5">
          <InsetSectionHeader
            title="Client Groups"
            subtitle="Narrow the list by flexible groups like Color, Extensions, VIP, or Blowouts."
          />
          <GroupFilterChipGroup
            activeValue={model.groupFilter}
            groups={model.clientGroups}
            onSelect={model.setGroupFilter}
          />
        </YStack>

        {model.availableTags.length > 0 ? (
          <YStack gap="$2.5">
            <InsetSectionHeader
              title="Saved Labels"
              subtitle="Quickly pull up tagged clients like VIPs or new consultations."
            />
            <FilterChipGroup
              activeValue={model.tagFilter}
              options={['All', ...model.availableTags]}
              onSelect={model.setTagFilter}
            />
          </YStack>
        ) : null}

        <InsetSectionFooter>
          Reset clears only the sheet filters. Your search text stays in place until you clear it from the search bar.
        </InsetSectionFooter>
      </YStack>
    </IOSBottomSheet>
  )
}

export function ClientsSectionFooter() {
  return null
}
