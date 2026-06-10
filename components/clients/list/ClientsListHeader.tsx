import { SlidersHorizontal } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  SecondaryButton,
  ThemedHeadingText,
} from 'components/ui/controls'
import { impactLightHaptic } from 'components/utils/haptics'

import { ClientsFilterPanel, ClientsSearchBar, ClientsSectionFooter } from './ClientsFilterPanel'
import type { ClientsSectionProps } from './sectionTypes'

export function ClientsListHeader({ model }: ClientsSectionProps) {
  const filterLabel = model.activeFilterCount
    ? `Filters (${model.activeFilterCount})`
    : 'Filters'

  return (
    <YStack
      px="$5"
      pt={model.topInset}
      pb="$3"
      gap="$3"
      bg={model.isGlass ? '$surfacePage' : '$background'}
      borderBottomWidth={1}
      borderBottomColor="$borderSubtle"
    >
      <XStack items="center" justify="space-between">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Client Index
        </ThemedHeadingText>
        <SecondaryButton
          testID="clients-filter-button"
          size="$2"
          px="$3"
          height={36}
          icon={<SlidersHorizontal size={15} color={model.hasActiveFilters ? '$accent' : '$textSecondary'} />}
          bg={model.hasActiveFilters ? '$surfaceChipActive' : undefined}
          borderColor={model.hasActiveFilters ? '$borderAccent' : undefined}
          onPress={() => {
            void impactLightHaptic()
            model.openFilterSheet()
          }}
        >
          <Text fontSize={12} color={model.hasActiveFilters ? '$accent' : '$textSecondary'}>
            {filterLabel}
          </Text>
        </SecondaryButton>
      </XStack>

      <ClientsSearchBar model={model} />
      <ClientsFilterPanel model={model} />
      <ClientsSectionFooter />
    </YStack>
  )
}
