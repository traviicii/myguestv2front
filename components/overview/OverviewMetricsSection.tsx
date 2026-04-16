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

const hasLongMetricValue = (value: string) => /[A-Za-z]/.test(value) || value.length > 10

export function OverviewMetricsSection({ model }: OverviewSectionProps) {
  const sectionGap = model.isCyberpunk ? '$2' : '$3'
  const metricCardHeight = model.isCyberpunk ? 92 : model.isGlass ? 96 : 90
  const editPanelCardBorder = {
    bg: '$surfaceCard',
    borderWidth: 1,
    borderColor: '$borderSubtle',
    rounded: model.controlRadius,
    gap: model.isCyberpunk ? '$2' : '$3',
  } as const
  const rowProps = model.isCyberpunk
    ? ({
        px: '$2.5',
        py: '$2',
        minH: 44,
        borderWidth: 1,
        borderColor: '$borderSubtle',
        bg: '$surfaceField',
        rounded: model.controlRadius,
      } as const)
    : ({
        py: '$1',
      } as const)

  return (
    <YStack gap={sectionGap}>
      <XStack items="center" justify="space-between">
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
        lineRadius={model.isCyberpunk ? 0 : 999}
        cardProps={editPanelCardBorder}
      >
        {() => (
          <YStack gap={model.isCyberpunk ? '$2' : '$1.5'}>
            {model.metrics.map((metric) => (
              <XStack
                key={metric.id}
                items="center"
                justify="space-between"
                gap="$3"
                {...rowProps}
              >
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
          </YStack>
        )}
      </ExpandableEditPanel>
      <XStack
        mt={model.showMetricEditor ? (model.isCyberpunk ? '$2' : '$3') : '$1'}
        gap="$3"
        flexWrap="wrap"
      >
        {model.metrics
          .filter((metric) => model.selectedMetrics.includes(metric.id))
          .map((metric) => {
            const compactValue = hasLongMetricValue(metric.value)
            const valueFontSize = compactValue ? 15 : 18
            const valueLineHeight = compactValue ? 18 : 22

            const valueNode = (
              <Text
                fontSize={valueFontSize}
                lineHeight={valueLineHeight}
                fontWeight="700"
                color="$color"
                numberOfLines={2}
              >
                {metric.value}
              </Text>
            )

            return model.isGlass ? (
              <SurfaceCard
                key={metric.id}
                tone="tabGlass"
                p="$4"
                gap="$1.5"
                rounded={model.sectionCardRadius}
                minW={140}
                minH={metricCardHeight}
                justify="space-between"
                flex={1}
              >
                <Text fontSize={12} color="$textSecondary">
                  {metric.label}
                </Text>
                {valueNode}
              </SurfaceCard>
            ) : (
              <YStack
                key={metric.id}
                {...cardSurfaceProps}
                p="$4"
                gap="$1.5"
                rounded={model.sectionCardRadius}
                minW={140}
                minH={metricCardHeight}
                justify="space-between"
                flex={1}
              >
                <Text fontSize={12} color="$textSecondary">
                  {metric.label}
                </Text>
                {valueNode}
              </YStack>
            )
          })}
      </XStack>
    </YStack>
  )
}
