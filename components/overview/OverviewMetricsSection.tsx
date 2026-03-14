import { Text, XStack, YStack } from 'tamagui'

import { ExpandableEditPanel } from 'components/ui/ExpandableEditPanel'
import {
  GhostButton,
  SurfaceCard,
  ThemedHeadingText,
  ThemedSwitch,
  cardSurfaceProps,
} from 'components/ui/controls'

import type { OverviewSectionProps } from './sectionTypes'

const editPanelCardBorder = {
  bg: '$surfaceCard',
  borderWidth: 1,
  borderColor: '$borderSubtle',
} as const

export function OverviewMetricsSection({ model }: OverviewSectionProps) {
  return (
    <YStack>
      <XStack items="center" justify="space-between" mb="$2">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Metrics
        </ThemedHeadingText>
        <GhostButton onPress={model.toggleMetricEditor}>
          {model.showMetricEditor ? 'Done' : 'Edit'}
        </GhostButton>
      </XStack>
      <ExpandableEditPanel
        visible={model.showMetricEditor}
        lineColor={model.lineColor}
        cardProps={editPanelCardBorder}
      >
        {() => (
          <>
            {model.metrics.map((metric) => (
              <XStack key={metric.id} items="center" justify="space-between">
                <Text fontSize={12} color="$textSecondary">
                  {metric.label}
                </Text>
                <ThemedSwitch
                  size="$2"
                  checked={model.selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => {
                    model.setMetricSelection(metric.id, checked)
                  }}
                />
              </XStack>
            ))}
          </>
        )}
      </ExpandableEditPanel>
      <XStack mt="$1" gap="$3" flexWrap="wrap">
        {model.metrics
          .filter((metric) => model.selectedMetrics.includes(metric.id))
          .map((metric) =>
            model.isGlass ? (
              <SurfaceCard
                key={metric.id}
                tone="tabGlass"
                p="$4"
                gap="$1"
                rounded={model.sectionCardRadius}
                minW={140}
                flex={1}
              >
                <Text fontSize={12} color="$textSecondary">
                  {metric.label}
                </Text>
                <Text fontSize={18} fontWeight="700" color="$color">
                  {metric.value}
                </Text>
              </SurfaceCard>
            ) : (
              <YStack
                key={metric.id}
                {...cardSurfaceProps}
                p="$4"
                rounded={model.sectionCardRadius}
                minW={140}
                flex={1}
              >
                <Text fontSize={12} color="$textSecondary">
                  {metric.label}
                </Text>
                <Text fontSize={18} fontWeight="700" color="$color">
                  {metric.value}
                </Text>
              </YStack>
            )
          )}
      </XStack>
    </YStack>
  )
}
