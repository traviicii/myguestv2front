import { useEffect, type ReactNode } from 'react'
import { YStack, type YStackProps } from 'tamagui'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { useExpandablePanel } from 'components/ui/useExpandablePanel'

const PANEL_DELAY = 90
const PANEL_DURATION = 220
const LINE_DURATION = 250
const LINE_UNDRAW_DELAY = PANEL_DELAY + PANEL_DURATION
const EXIT_HIDE_DELAY = LINE_UNDRAW_DELAY + LINE_DURATION + 60

type ExpandableEditPanelProps = {
  visible: boolean
  lineColor: string
  cardProps?: YStackProps
  children: () => ReactNode
}

export const ExpandableEditPanel = ({
  visible,
  lineColor,
  cardProps,
  children,
}: ExpandableEditPanelProps) => {
  // Usage: wrap edit controls with <ExpandableEditPanel visible lineColor cardProps>
  // so the line + panel expansion/collapse stay consistent across the app.
  const lineWidth = useSharedValue(0)
  const lineProgress = useSharedValue(visible ? 1 : 0)
  const panel = useExpandablePanel(visible, {
    hideDelayMs: EXIT_HIDE_DELAY,
    panelDelayMs: PANEL_DELAY,
    panelDurationMs: PANEL_DURATION,
  })
  const shouldRenderLine = visible || panel.showPanel

  useEffect(() => {
    if (visible) {
      lineProgress.value = withTiming(1, {
        duration: LINE_DURATION,
        easing: Easing.out(Easing.cubic),
      })
    } else {
      lineProgress.value = withDelay(
        LINE_UNDRAW_DELAY,
        withTiming(0, { duration: LINE_DURATION, easing: Easing.in(Easing.cubic) })
      )
    }
  }, [lineProgress, visible])

  const lineStyle = useAnimatedStyle(() => {
    const width = lineWidth.value
    const progress = lineProgress.value
    return {
      width,
      opacity: progress,
      transform: [
        { translateX: ((1 - progress) * width) / 2 },
        { scaleX: progress },
      ],
    }
  })

  const cardStyle: YStackProps = {
    rounded: '$5',
    p: '$4',
    gap: '$3',
    ...cardProps,
  }

  const renderContent = children
  if (!visible && !panel.showPanel) {
    return null
  }

  return (
    <YStack position="relative">
      {shouldRenderLine ? (
        <YStack
          position="absolute"
          l={0}
          r={0}
          t={0}
          pointerEvents="none"
          style={{ zIndex: 2 }}
          onLayout={(event) => {
            lineWidth.value = event.nativeEvent.layout.width
          }}
          items="flex-end"
        >
          <Animated.View
            style={[
              {
                height: 2,
                backgroundColor: lineColor,
                borderRadius: 999,
              },
              lineStyle,
            ]}
          />
        </YStack>
      ) : null}
      {panel.showPanel ? (
        <YStack position="relative">
          <YStack
            position="absolute"
            l={0}
            r={0}
            t={0}
            opacity={0}
            pointerEvents="none"
            onLayout={(event) => {
              panel.setMeasured(event.nativeEvent.layout.height)
            }}
          >
            <YStack pt="$2">
              <YStack {...cardStyle}>{renderContent()}</YStack>
            </YStack>
          </YStack>
          <Animated.View style={[{ overflow: 'hidden' }, panel.animatedStyle]}>
            <YStack pt="$2">
              <YStack {...cardStyle}>{renderContent()}</YStack>
            </YStack>
          </Animated.View>
        </YStack>
      ) : null}
    </YStack>
  )
}
