import { Search, X } from '@tamagui/lucide-icons'
import { XStack, YStack } from 'tamagui'

import { ExpandableEditPanel } from 'components/ui/ExpandableEditPanel'
import {
  OptionChip,
  OptionChipLabel,
  SectionDivider,
  TextField,
  cardSurfaceProps,
} from 'components/ui/controls'

import type { ClientsSectionProps } from './sectionTypes'

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const
const TYPE_FILTERS = ['All', 'Cut', 'Color', 'Cut & Color'] as const

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
    <ExpandableEditPanel
      visible={model.showFilters && model.hasClients}
      lineColor={model.lineColor}
      cardProps={{
        ...cardSurfaceProps,
        rounded: model.chipRadius,
        p: '$3',
        gap: '$3',
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
      }}
    >
      {() => (
        <>
          <YStack gap="$3">
            <XStack gap="$2" flexWrap="wrap">
              {STATUS_FILTERS.map((status) => (
                <OptionChip
                  key={status}
                  active={model.statusFilter === status}
                  rounded={model.chipRadius}
                  onPress={() => model.setStatusFilter(status)}
                >
                  <OptionChipLabel active={model.statusFilter === status}>
                    {status}
                  </OptionChipLabel>
                </OptionChip>
              ))}
            </XStack>

            <XStack gap="$2" flexWrap="wrap">
              {TYPE_FILTERS.map((type) => (
                <OptionChip
                  key={type}
                  active={model.typeFilter === type}
                  rounded={model.chipRadius}
                  onPress={() => model.setTypeFilter(type)}
                >
                  <OptionChipLabel active={model.typeFilter === type}>
                    {type}
                  </OptionChipLabel>
                </OptionChip>
              ))}
            </XStack>
          </YStack>
        </>
      )}
    </ExpandableEditPanel>
  )
}

export function ClientsSectionFooter() {
  return <SectionDivider />
}
