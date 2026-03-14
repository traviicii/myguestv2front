import { Text, XStack, YStack } from 'tamagui'

import type { ClientDetailSectionProps } from './sectionTypes'

export function ClientHeroSection({ model }: ClientDetailSectionProps) {
  if (!model.client) return null

  return (
    <YStack gap="$2">
      <Text fontSize={20} fontWeight="700">
        {model.client.name}
      </Text>
      <XStack items="center" gap="$2" flexWrap="wrap">
        <Text fontSize={12} color="$textSecondary">
          {model.client.type}
        </Text>
        {model.showStatus ? (
          <Text fontSize={11} color={model.statusColor}>
            {model.statusLabel}
          </Text>
        ) : null}
        {model.client.tag && model.client.tag !== model.client.type ? (
          <Text fontSize={11} color="$textMuted">
            {model.client.tag}
          </Text>
        ) : null}
      </XStack>
      <Text fontSize={12} color="$textSecondary">
        Last visit {model.formatLastVisitLabel(model.latestHistoryDate ?? model.client.lastVisit)}
      </Text>
    </YStack>
  )
}
