import { Text, YStack } from 'tamagui'

import type { ClientDetailSectionProps } from './sectionTypes'
import { ClientDetailCard, ClientDetailSectionTitle } from './ClientDetailPrimitives'

export function ClientNotesSection({ model }: ClientDetailSectionProps) {
  if (!model.client) return null

  return (
    <YStack gap="$3">
      <ClientDetailSectionTitle>Notes</ClientDetailSectionTitle>
      <ClientDetailCard model={model} rounded={model.cardRadius} p="$4">
        <Text fontSize={12} color="$textSecondary">
          {model.client.notes}
        </Text>
      </ClientDetailCard>
    </YStack>
  )
}
