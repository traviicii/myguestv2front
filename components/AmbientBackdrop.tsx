import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { YStack, useTheme } from 'tamagui'
import { useThemePrefs } from './ThemePrefs'
import { toNativeColor } from './utils/color'

export type AmbientEffectMode = 'auto' | 'off' | 'faux'

type AmbientBackdropProps = {
  effectMode?: AmbientEffectMode
}

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(upper, Math.max(lower, value))

const toAlpha = (value: string, alpha: number) => {
  const color = value.trim()
  if (color.startsWith('#')) {
    const raw = color.slice(1)
    const normalized =
      raw.length === 3
        ? raw
            .split('')
            .map((char) => `${char}${char}`)
            .join('')
        : raw
    if (normalized.length !== 6) return color
    const r = Number.parseInt(normalized.slice(0, 2), 16)
    const g = Number.parseInt(normalized.slice(2, 4), 16)
    const b = Number.parseInt(normalized.slice(4, 6), 16)
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return color
    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`
  }

  const rgbMatch = color.match(
    /^rgba?\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)(?:\s*,\s*(-?\d*\.?\d+)\s*)?\)$/i
  )
  if (!rgbMatch) return color
  const r = Math.round(clamp(Number(rgbMatch[1]), 0, 255))
  const g = Math.round(clamp(Number(rgbMatch[2]), 0, 255))
  const b = Math.round(clamp(Number(rgbMatch[3]), 0, 255))
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`
}

export function AmbientBackdrop({ effectMode = 'auto' }: AmbientBackdropProps) {
  const theme = useTheme()
  const { aesthetic, mode } = useThemePrefs()
  const drift = useRef(new Animated.Value(0)).current
  const sheen = useRef(new Animated.Value(0)).current
  const resolvedMode: AmbientEffectMode = effectMode === 'auto' ? 'faux' : effectMode

  useEffect(() => {
    drift.stopAnimation()
    sheen.stopAnimation()

    if (resolvedMode === 'off') {
      drift.setValue(0)
      sheen.setValue(0)
      return
    }

    if (aesthetic !== 'glass') {
      drift.setValue(0)
      sheen.setValue(0)
      return
    }

    drift.setValue(0)
    sheen.setValue(0)

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 6400,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: -1,
          duration: 6400,
          useNativeDriver: true,
        }),
      ])
    )

    const sheenLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sheen, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(sheen, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ])
    )

    driftLoop.start()
    sheenLoop.start()

    return () => {
      driftLoop.stop()
      sheenLoop.stop()
    }
  }, [aesthetic, drift, effectMode, resolvedMode, sheen])

  if (resolvedMode === 'off') {
    return null
  }

  const glassLight = aesthetic === 'glass' && mode === 'light'
  const accentOpacity =
    aesthetic === 'cyberpunk' ? 0.26 : glassLight ? 0.27 : aesthetic === 'glass' ? 0.24 : 0.1
  const secondaryOpacity =
    aesthetic === 'cyberpunk' ? 0.16 : glassLight ? 0.18 : aesthetic === 'glass' ? 0.16 : 0.08
  const veilOpacity = glassLight ? 0.18 : aesthetic === 'glass' ? 0.2 : 0.08
  const backdropStart = toNativeColor(
    theme.backdropStart?.val,
    mode === 'dark' ? '#223047' : '#D9EAFF'
  )
  const backdropEnd = toNativeColor(
    theme.backdropEnd?.val,
    mode === 'dark' ? '#101B2A' : '#F1F7FF'
  )
  const backdropAccent = toNativeColor(
    theme.backdropAccent?.val,
    mode === 'dark' ? '#86A7FF' : '#A8C7FF'
  )

  const topDrift =
    aesthetic === 'glass'
      ? drift.interpolate({ inputRange: [-1, 1], outputRange: [-10, 12] })
      : 0
  const lowerDrift =
    aesthetic === 'glass'
      ? drift.interpolate({ inputRange: [-1, 1], outputRange: [8, -9] })
      : 0
  const sheenOpacity =
    aesthetic === 'glass'
      ? sheen.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] })
      : 0
  const isGlassNative = aesthetic === 'glass'

  // Faux ambient treatment built from semantic tokens so future blur/gradient
  // libraries can be dropped in behind this component without screen changes.
  return (
    <YStack
      pointerEvents="none"
      position="absolute"
      t={0}
      l={0}
      r={0}
      b={0}
      overflow="hidden"
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: -120,
          right: -90,
          transform: [{ translateY: topDrift as any }],
          opacity: accentOpacity,
        }}
      >
        {isGlassNative ? (
          <LinearGradient
            colors={
              mode === 'dark'
                ? [toAlpha(backdropAccent, 0.52), toAlpha(backdropStart, 0.1)]
                : [toAlpha(backdropAccent, 0.68), toAlpha(backdropStart, 0.16)]
            }
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{ width: 320, height: 320, borderRadius: 999 }}
          />
        ) : (
          <YStack width={320} height={320} rounded={999} bg="$backdropAccent" />
        )}
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          bottom: -140,
          left: -100,
          transform: [{ translateY: lowerDrift as any }],
          opacity: secondaryOpacity,
        }}
      >
        {isGlassNative ? (
          <LinearGradient
            colors={
              mode === 'dark'
                ? [toAlpha(backdropStart, 0.4), toAlpha(backdropEnd, 0.08)]
                : [toAlpha(backdropStart, 0.48), toAlpha(backdropEnd, 0.12)]
            }
            start={{ x: 0, y: 0.12 }}
            end={{ x: 1, y: 0.92 }}
            style={{ width: 300, height: 300, borderRadius: 999 }}
          />
        ) : (
          <YStack width={300} height={300} rounded={999} bg="$backdropStart" />
        )}
      </Animated.View>

      {isGlassNative ? (
        <BlurView
          pointerEvents="none"
          tint={mode === 'dark' ? 'dark' : 'light'}
          intensity={mode === 'dark' ? 24 : 28}
          style={{
            position: 'absolute',
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
          }}
        />
      ) : null}

      {aesthetic === 'glass' ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: -40,
            left: -30,
            right: -30,
            height: 180,
            borderRadius: 80,
            backgroundColor: toAlpha(backdropAccent, mode === 'dark' ? 0.4 : 0.2),
            opacity: sheenOpacity as any,
            transform: [{ rotate: '-4deg' }],
          }}
        />
      ) : null}

      <YStack
        position="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        bg="$backdropEnd"
        opacity={veilOpacity}
      />
    </YStack>
  )
}
