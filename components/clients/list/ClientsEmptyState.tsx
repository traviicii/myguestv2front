import type { ReactNode } from 'react'
import { Text, YStack } from 'tamagui'

import { PreviewCard, PrimaryButton } from 'components/ui/controls'

import type { ClientsSectionProps } from './sectionTypes'

type ClientsEmptyStateProps = ClientsSectionProps & {
  onNewClient: () => void
}

function EmptyStateCard({ children }: { children: ReactNode }) {
  return (
    <YStack px="$5" pt="$2">
      <PreviewCard p="$4" gap="$2" items="center">
        {children}
      </PreviewCard>
    </YStack>
  )
}

export function ClientsEmptyState({ model, onNewClient }: ClientsEmptyStateProps) {
  if (!model.hasClients) {
    return (
      <EmptyStateCard>
        <Text fontSize={14} fontWeight="600">
          No clients yet
        </Text>
        <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
          Add your first client to get started.
        </Text>
        <PrimaryButton onPress={onNewClient}>New Client</PrimaryButton>
      </EmptyStateCard>
    )
  }

  if (!model.hasFilteredClients) {
    return (
      <EmptyStateCard>
        <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
          No clients match your search or filters.
        </Text>
        <PrimaryButton onPress={model.resetFilters}>Clear filters</PrimaryButton>
      </EmptyStateCard>
    )
  }

  return null
}
