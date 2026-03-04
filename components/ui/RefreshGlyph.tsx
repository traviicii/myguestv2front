import { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import { Sparkles } from '@tamagui/lucide-icons'
import { useTheme } from 'tamagui'
import Svg, { Circle } from 'react-native-svg'
import { useThemePrefs } from 'components/ThemePrefs'
import { SurfaceCard } from 'components/ui/controls'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

type RefreshGlyphProps = {
  progress: Animated.Value | Animated.AnimatedInterpolation<number>
  refreshing: boolean
  thresholdReached?: boolean
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

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
          useNativeDriver: true,
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
    refreshValue.setValue(refreshing ? 1 : 0)
  }, [refreshing, refreshValue])

  const revealCombined = Animated.add(progress as any, refreshValue).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  const visibility = Animated.add(progress as any, revealCombined).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  const opacity = visibility.interpolate({
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
    outputRange: [-28, 4],
    extrapolate: 'clamp',
  })
  const pullRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })
  const spinRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const accentColor = useMemo(
    () => toNativeColor(theme.accent?.val, FALLBACK_COLORS.accent),
    [theme.accent?.val]
  )
  const baseRingColor = toNativeColor(theme.textMuted?.val, '#B9B2C4')
  const ringColor = accentColor
  const ringOpacity = thresholdReached ? 1 : 0.85
  const size = 36
  const stroke = 3.4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ringProgress = Animated.add(progress as any, refreshValue).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  const dashOffset = Animated.subtract(
    circumference,
    Animated.multiply(ringProgress, circumference)
  )
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
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
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
            stroke={ringColor}
            strokeWidth={stroke}
            opacity={ringOpacity}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            fill="transparent"
          />
        </Svg>
        <Animated.View style={{ transform: [{ rotate: pullRotate }, { rotate: spinRotate }] }}>
          <Sparkles size={16} color={accentColor} />
        </Animated.View>
      </SurfaceCard>
    </Animated.View>
  )
}
