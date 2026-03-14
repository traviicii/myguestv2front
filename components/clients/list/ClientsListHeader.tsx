import { SlidersHorizontal } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  ThemedHeadingText,
  cardSurfaceProps,
} from 'components/ui/controls'

import { ClientsFilterPanel, ClientsSearchBar, ClientsSectionFooter } from './ClientsFilterPanel'
import type { ClientsSectionProps } from './sectionTypes'

export function ClientsListHeader({ model }: ClientsSectionProps) {
  return (
    <YStack px="$5" pt={model.topInset} gap="$4">
      <XStack items="center" justify="space-between">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Client Index
        </ThemedHeadingText>
        <XStack
          {...cardSurfaceProps}
          rounded={model.controlRadius}
          px="$3"
          py="$2.5"
          items="center"
          gap="$2"
          onPress={model.toggleFilters}
        >
          <SlidersHorizontal size={16} color="$textSecondary" />
          <Text fontSize={12} color="$textSecondary">
            {model.showFilters ? 'Hide Filters' : 'Filters'}
          </Text>
        </XStack>
      </XStack>

      <ClientsSearchBar model={model} />
      <ClientsFilterPanel model={model} />
      <ClientsSectionFooter />
    </YStack>
  )
}
