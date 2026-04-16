import { useState } from 'react'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'

import type { OverviewAttentionCard } from './overviewModelTypes'
import type { OverviewNavigableSectionProps } from './sectionTypes'

function AttentionCard({
  card,
  model,
  onNavigate,
}: {
  card: OverviewAttentionCard
  model: Pick<
    OverviewNavigableSectionProps['model'],
    'controlRadius' | 'isCyberpunk' | 'isGlass' | 'sectionCardRadius'
  >
  onNavigate: OverviewNavigableSectionProps['onNavigate']
}) {
  const [expanded, setExpanded] = useState(false)
  const countColor =
    card.priority === 'high'
      ? '$danger'
      : card.priority === 'medium'
        ? '$accent'
        : '$color'

  return (
    <SurfaceCard
      p={model.isCyberpunk ? '$3' : '$4'}
      gap={model.isCyberpunk ? '$2' : '$2.5'}
      rounded={model.sectionCardRadius}
      tone={model.isGlass ? 'secondary' : 'default'}
    >
      <XStack items="center" justify="space-between" gap="$3">
        <YStack flex={1} gap="$1">
          <Text fontSize={12} color="$textSecondary">
            {card.label}
          </Text>
          <Text fontSize={12} color="$textMuted">
            {card.summary}
          </Text>
        </YStack>
        <YStack items="flex-end" gap="$1">
          <Text fontSize={26} fontWeight="700" color={countColor}>
            {card.count}
          </Text>
          <XStack
            items="center"
            gap="$1"
            px={model.isCyberpunk ? '$1.5' : '$2'}
            py="$1"
            rounded={model.controlRadius}
            borderWidth={model.isCyberpunk ? 1 : 0}
            borderColor="$borderSubtle"
            bg={model.isCyberpunk ? '$surfaceField' : 'transparent'}
            onPress={() => setExpanded((current) => !current)}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text fontSize={11} color="$accent">
              {expanded ? 'Hide' : 'Show'}
            </Text>
            {expanded ? <ChevronUp size={14} color="$accent" /> : <ChevronDown size={14} color="$accent" />}
          </XStack>
        </YStack>
      </XStack>

      {expanded && card.previewItems.length > 0 ? (
        <YStack pt="$1.5" gap="$1.5" borderTopWidth={1} borderTopColor="$borderSubtle">
          {card.previewItems.map((item) => (
            <YStack
              key={`${card.id}-${item.clientId}`}
              rounded={model.controlRadius}
              px="$3"
              py="$2.5"
              bg={model.isCyberpunk ? '$surfaceField' : '$surfacePreview'}
              borderWidth={model.isCyberpunk ? 1 : 0}
              borderColor="$borderSubtle"
              pressStyle={{ opacity: 0.85 }}
              onPress={() =>
                onNavigate({ pathname: '/client/[id]', params: { id: item.clientId } })
              }
            >
              <XStack items="center" justify="space-between" gap="$3">
                <YStack flex={1} gap="$0.5">
                  <Text fontSize={13} fontWeight="600">
                    {item.clientName}
                  </Text>
                  <Text fontSize={11} color="$textSecondary">
                    {item.primaryLabel}
                  </Text>
                  <Text fontSize={11} color="$textMuted">
                    {item.secondaryLabel}
                  </Text>
                </YStack>
                <Text fontSize={11} color="$accent">
                  Open
                </Text>
              </XStack>
            </YStack>
          ))}
        </YStack>
      ) : null}
    </SurfaceCard>
  )
}

export function OverviewNeedsAttentionSection({
  model,
  onNavigate,
}: OverviewNavigableSectionProps) {
  const sectionGap = model.isCyberpunk ? '$2' : '$3'
  const activeCards = model.attentionCards.filter((card) => card.count > 0)

  return (
    <YStack gap={sectionGap}>
      <ThemedHeadingText fontWeight="700" fontSize={16}>
        Upcoming
      </ThemedHeadingText>
      {activeCards.length ? (
        <YStack gap={sectionGap}>
          {activeCards.map((card) => (
            <AttentionCard
              key={card.id}
              card={card}
              model={model}
              onNavigate={onNavigate}
            />
          ))}
        </YStack>
      ) : (
        <SurfaceCard
          p="$4"
          gap="$2"
          rounded={model.sectionCardRadius}
          tone={model.isGlass ? 'secondary' : 'default'}
        >
          <Text fontSize={14} fontWeight="600">
            You're all caught up
          </Text>
          <Text fontSize={12} color="$textSecondary">
            No overdue clients, due-soon follow-ups, or upcoming birthdays right now.
          </Text>
        </SurfaceCard>
      )}
    </YStack>
  )
}
