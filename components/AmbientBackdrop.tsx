import { Animated } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { YStack, useTheme } from 'tamagui'

import { useThemePrefs } from './ThemePrefs'
import type { AmbientEffectMode } from './ambientBackdropTypes'
import {
  buildAmbientBackdropVisuals,
  resolveAmbientEffectMode,
  shouldAnimateAmbientBackdrop,
  toAlpha,
} from './ambientBackdropUtils'
import { useAmbientBackdropMotion } from './useAmbientBackdropMotion'
import { toNativeColor } from './utils/color'

export type { AmbientEffectMode } from './ambientBackdropTypes'

type AmbientBackdropProps = {
  effectMode?: AmbientEffectMode
}

export function AmbientBackdrop({ effectMode = 'auto' }: AmbientBackdropProps) {
  const theme = useTheme()
  const { aesthetic, mode, palette } = useThemePrefs()
  const resolvedMode = resolveAmbientEffectMode(effectMode)
  const motion = useAmbientBackdropMotion(
    shouldAnimateAmbientBackdrop(resolvedMode, aesthetic)
  )

  if (resolvedMode === 'off') {
    return null
  }

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
  const visuals = buildAmbientBackdropVisuals({
    aesthetic,
    mode,
    palette,
    backdropStart,
    backdropEnd,
    backdropAccent,
  })

  const topDrift =
    aesthetic === 'glass'
      ? motion.drift.interpolate({ inputRange: [-1, 1], outputRange: [-10, 12] })
      : 0
  const lowerDrift =
    aesthetic === 'glass'
      ? motion.drift.interpolate({ inputRange: [-1, 1], outputRange: [8, -9] })
      : 0
  const blobDriftX = visuals.glassLight
    ? motion.blob.interpolate({ inputRange: [-1, 1], outputRange: [-40, 50] })
    : 0
  const blobDriftY = visuals.glassLight
    ? motion.blob.interpolate({ inputRange: [-1, 1], outputRange: [30, -24] })
    : 0
  const blobScale = visuals.glassLight
    ? motion.blob.interpolate({ inputRange: [-1, 1], outputRange: [1.02, 1.08] })
    : 1
  const sheenOpacity =
    aesthetic === 'glass'
      ? motion.sheen.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] })
      : 0

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
      {visuals.glassLiquidBase ? (
        <LinearGradient
          colors={visuals.glassLiquidBase}
          locations={[0, 0.55, 1]}
          start={{ x: 0.08, y: 0 }}
          end={{ x: 0.92, y: 1 }}
          style={{
            position: 'absolute',
            top: -40,
            left: -40,
            right: -40,
            bottom: -40,
          }}
        />
      ) : null}

      {visuals.glassLight ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: -160,
            left: -120,
            transform: [
              { translateX: blobDriftX as any },
              { translateY: blobDriftY as any },
              { scale: blobScale as any },
            ],
            opacity: visuals.blobOpacity,
          }}
        >
          <LinearGradient
            colors={[
              toAlpha(backdropAccent, visuals.blobAccentAlpha),
              toAlpha(backdropStart, visuals.blobStartAlpha),
              toAlpha(backdropEnd, visuals.blobEndAlpha),
            ]}
            locations={[0, 0.52, 1]}
            start={{ x: 0.12, y: 0.08 }}
            end={{ x: 0.9, y: 1 }}
            style={{ width: 420, height: 420, borderRadius: 999 }}
          />
        </Animated.View>
      ) : null}

      {aesthetic !== 'cyberpunk' && visuals.showAmbientShapes ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: -120,
            right: -90,
            transform: [{ translateY: topDrift as any }],
            opacity: visuals.accentOpacity,
          }}
        >
          {visuals.isGlassNative ? (
            <LinearGradient
              colors={visuals.topShapeColors}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={{ width: 320, height: 320, borderRadius: 999 }}
            />
          ) : (
            <YStack width={320} height={320} rounded={999} bg="$backdropAccent" />
          )}
        </Animated.View>
      ) : null}

      {aesthetic !== 'cyberpunk' && visuals.showAmbientShapes ? (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: -140,
            left: -100,
            transform: [{ translateY: lowerDrift as any }],
            opacity: visuals.secondaryOpacity,
          }}
        >
          {visuals.isGlassNative ? (
            <LinearGradient
              colors={visuals.lowerShapeColors}
              start={{ x: 0, y: 0.12 }}
              end={{ x: 1, y: 0.92 }}
              style={{ width: 300, height: 300, borderRadius: 999 }}
            />
          ) : (
            <YStack width={300} height={300} rounded={999} bg="$backdropStart" />
          )}
        </Animated.View>
      ) : null}

      {visuals.isGlassNative ? (
        <BlurView
          pointerEvents="none"
          tint={mode === 'dark' ? 'dark' : 'light'}
          intensity={visuals.blurIntensity}
          style={{
            position: 'absolute',
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
          }}
        />
      ) : null}

      {aesthetic === 'glass' && visuals.showAmbientShapes ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: -40,
            left: -30,
            right: -30,
            height: 180,
            borderRadius: 80,
            backgroundColor: visuals.sheenColor,
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
        opacity={visuals.veilOpacity}
      />
    </YStack>
  )
}
