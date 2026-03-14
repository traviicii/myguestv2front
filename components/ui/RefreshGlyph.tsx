import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { useTheme } from 'tamagui'
import { useThemePrefs } from 'components/ThemePrefs'
import { SurfaceCard } from 'components/ui/controls'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export const REFRESH_REVEAL_HEIGHT = 44

type RefreshGlyphProps = {
  progress: Animated.Value | Animated.AnimatedInterpolation<number>
  refreshing: boolean
  thresholdReached?: boolean
}

export function RefreshGlyph({ progress, refreshing, thresholdReached }: RefreshGlyphProps) {
  const theme = useTheme()
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const spin = useRef(new Animated.Value(0)).current
  const refreshValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null
    if (refreshing) {
      spin.setValue(0)
      loop = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      )
      loop.start()
    } else {
      spin.stopAnimation()
      spin.setValue(0)
    }
    return () => {
      loop?.stop()
    }
  }, [refreshValue, refreshing, spin])

  useEffect(() => {
    Animated.timing(refreshValue, {
      toValue: refreshing ? 1 : 0,
      duration: refreshing ? 140 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [refreshing, refreshValue])

  const revealCombined = Animated.add(progress as any, refreshValue).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  const opacity = revealCombined.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  })
  const scale = revealCombined.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.05],
    extrapolate: 'clamp',
  })
  const translateY = revealCombined.interpolate({
    inputRange: [0, 1],
    outputRange: [-REFRESH_REVEAL_HEIGHT, 0],
    extrapolate: 'clamp',
  })
  const spinRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const accentColor = toNativeColor(theme.accent?.val, FALLBACK_COLORS.glassAccentLight)
  const baseRingColor = toNativeColor(theme.textMuted?.val, FALLBACK_COLORS.textSecondary)
  const ringOpacity = thresholdReached ? 1 : 0.85
  const size = 36
  const stroke = 3.2
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const minArc = 0.1
  const pullArc = Animated.add(
    minArc,
    Animated.multiply(progress as any, 1 - minArc)
  )
  const refreshArc = Animated.multiply(refreshValue, 0.28)
  const pullArcWeighted = Animated.multiply(
    pullArc,
    Animated.subtract(1, refreshValue)
  )
  const ringProgress = Animated.add(refreshArc, pullArcWeighted).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  const dashArray = ringProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [`0 ${circumference}`, `${circumference} ${circumference}`],
  })
  const dashOffset = circumference * 0.25
  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }, { scale }] }}
    >
      <SurfaceCard
        mode="alwaysCard"
        tone={isGlass ? 'secondary' : 'default'}
        width={size}
        height={size}
        rounded={999}
        items="center"
        justify="center"
        p="$0"
      >
        <Animated.View style={{ transform: [{ rotate: spinRotate }] }}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={baseRingColor}
              strokeWidth={stroke}
              opacity={0.25}
              fill="transparent"
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={accentColor}
              strokeWidth={stroke}
              opacity={ringOpacity}
              strokeLinecap="round"
              strokeDasharray={dashArray as any}
              strokeDashoffset={dashOffset}
              fill="transparent"
            />
          </Svg>
        </Animated.View>
      </SurfaceCard>
    </Animated.View>
  )
}
