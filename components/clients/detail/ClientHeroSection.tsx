import { Text, XStack, YStack } from 'tamagui'

import { chipSurfaceProps } from 'components/ui/controls'
import { getClientGroupSummary } from 'components/utils/clientGroups'

import type { ClientDetailSectionProps } from './sectionTypes'

export function ClientHeroSection({ model }: ClientDetailSectionProps) {
  if (!model.client) return null
  const groups = model.client.groups ?? []
  const hasGroups = groups.length > 0
  const groupSummary = getClientGroupSummary(model.client, { maxVisible: Number.MAX_SAFE_INTEGER })
  const shouldShowClientTag = Boolean(model.client.tag && model.client.tag !== groupSummary)

  return (
    <YStack gap="$2">
      <Text fontSize={20} fontWeight="700" selectable>
        {model.client.name}
      </Text>
      <YStack gap="$1.5">
        {hasGroups ? (
          <XStack items="center" gap="$1.5" rowGap="$1.5" flexWrap="wrap">
            {groups.map((group) => (
              <XStack
                key={group.id}
                {...chipSurfaceProps}
                rounded={model.isCyberpunk ? 0 : 999}
                px="$2.5"
                py="$1"
                maxW="100%"
              >
                <Text
                  fontSize={11}
                  fontWeight="600"
                  color="$textSecondary"
                  numberOfLines={1}
                  selectable
                >
                  {group.name}
                </Text>
              </XStack>
            ))}
          </XStack>
        ) : (
          <Text fontSize={12} color="$textSecondary" selectable>
            {groupSummary}
          </Text>
        )}
        {model.showStatus || shouldShowClientTag ? (
          <XStack items="center" gap="$2" flexWrap="wrap">
            {model.showStatus ? (
              <Text fontSize={11} color={model.statusColor} selectable>
                {model.statusLabel}
              </Text>
            ) : null}
            {shouldShowClientTag ? (
              <Text fontSize={11} color="$textMuted" selectable>
                {model.client.tag}
              </Text>
            ) : null}
          </XStack>
        ) : null}
      </YStack>
      <Text fontSize={12} color="$textSecondary" selectable>
        Last visit {model.formatLastVisitLabel(model.latestHistoryDate ?? model.client.lastVisit)}
      </Text>
    </YStack>
  )
}
