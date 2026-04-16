import { Animated } from 'react-native'
import { Text, YStack, useTheme } from 'tamagui'

import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

import { SurfaceCard } from './controls'
import { RefreshGlyph } from './RefreshGlyph'

type PullToRefreshOverlayProps = {
  top: number
  progress: Animated.Value
  refreshing: boolean
  thresholdReached: boolean
  pullActive: boolean
  feedbackMessage?: string | null
}

export function PullToRefreshOverlay({
  top,
  progress,
  refreshing,
  thresholdReached,
  pullActive,
  feedbackMessage,
}: PullToRefreshOverlayProps) {
  const theme = useTheme()

  const label =
    feedbackMessage ??
    (thresholdReached ? 'Release to refresh' : pullActive ? 'Pull to refresh' : null)

  if (!refreshing && !pullActive && !feedbackMessage) return null

  return (
    <YStack
      pointerEvents="none"
      position="absolute"
      t={top}
      l={0}
      r={0}
      items="center"
      gap="$2"
      style={{ zIndex: 20 }}
    >
      <RefreshGlyph
        progress={progress}
        refreshing={refreshing}
        thresholdReached={thresholdReached}
      />
      {label ? (
        <SurfaceCard mode="alwaysCard" tone="secondary" px="$3" py="$2" rounded={999}>
          <Text
            style={{
              color: toNativeColor(theme.textSecondary?.val, FALLBACK_COLORS.textSecondary),
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {label}
          </Text>
        </SurfaceCard>
      ) : null}
    </YStack>
  )
}
