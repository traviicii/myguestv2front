import { useState } from 'react'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import {
  GhostButton,
  PreviewCard,
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
    'controlRadius' | 'isGlass' | 'sectionCardRadius'
  >
  onNavigate: OverviewNavigableSectionProps['onNavigate']
}) {
  const [expanded, setExpanded] = useState(card.count > 0)

  return (
    <SurfaceCard
      p="$4"
      gap="$3"
      rounded={model.sectionCardRadius}
      minW={180}
      flex={1}
      tone={model.isGlass ? 'secondary' : 'default'}
    >
      <XStack items="flex-start" justify="space-between" gap="$2">
        <YStack gap="$1">
          <Text fontSize={12} color="$textSecondary">
            {card.label}
          </Text>
          <Text fontSize={24} fontWeight="700">
            {card.count}
          </Text>
        </YStack>
        {card.count > 0 ? (
          <GhostButton onPress={() => setExpanded((current) => !current)}>
            <XStack items="center" gap="$1">
              <Text fontSize={12} color="$accent">
                {expanded ? 'Hide' : 'Show'}
              </Text>
              {expanded ? <ChevronUp size={14} color="$accent" /> : <ChevronDown size={14} color="$accent" />}
            </XStack>
          </GhostButton>
        ) : null}
      </XStack>

      {expanded && card.previewItems.length > 0 ? (
        <YStack gap="$2">
          {card.previewItems.map((item) => (
            <PreviewCard
              key={`${card.id}-${item.clientId}`}
              rounded={model.controlRadius}
              p="$3"
              gap="$3"
              pressStyle={{ opacity: 0.85 }}
              onPress={() => onNavigate({ pathname: '/client/[id]', params: { id: item.clientId } })}
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
                <Text fontSize={12} color="$accent">
                  Open
                </Text>
              </XStack>
            </PreviewCard>
          ))}
        </YStack>
      ) : (
        <Text fontSize={12} color="$textSecondary">
          {card.emptyLabel}
        </Text>
      )}
    </SurfaceCard>
  )
}

export function OverviewNeedsAttentionSection({
  model,
  onNavigate,
}: OverviewNavigableSectionProps) {
  return (
    <YStack gap="$3">
      <ThemedHeadingText fontWeight="700" fontSize={16}>
        Needs Attention
      </ThemedHeadingText>
      <XStack gap="$3" flexWrap="wrap">
        {model.attentionCards.map((card) => (
          <AttentionCard
            key={card.id}
            card={card}
            model={model}
            onNavigate={onNavigate}
          />
        ))}
      </XStack>
    </YStack>
  )
}
