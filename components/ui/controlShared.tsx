import { cloneElement, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Button, useTheme } from 'tamagui'

import { useThemePrefs, type ThemeAesthetic } from '../ThemePrefs'
import { toNativeColor } from 'components/utils/color'
import {
  getGlassBlurIntensity,
  getGlassLayerColors,
  type GlassDensity,
} from './glassStyle'

export type CardMode = 'section' | 'panel' | 'alwaysCard'
export type SurfaceTone = 'default' | 'secondary' | 'tabGlass'
export type HeaderMotif = 'auto' | 'plain' | 'bracket'

type AestheticProfile = {
  cardRadius: number
  panelRadius: number
  controlRadius: number
  chipRadius: number
  inputRadius: number
  switchRadius: number
  previewRadius: number
  chipBorderWidth: number
  sectionTransparent: boolean
  headingFontFamily?: string
  labelFontFamily?: string
  headingUppercase: boolean
  labelUppercase: boolean
  buttonUppercase: boolean
  eyebrowUppercase: boolean
  bracketHeaders: boolean
  bracketLabels: boolean
  dividerOpacity: number
  dividerWidth: number
  buttonPressOpacity: number
}

const AESTHETIC_PROFILE: Record<ThemeAesthetic, AestheticProfile> = {
  modern: {
    cardRadius: 0,
    panelRadius: 14,
    controlRadius: 10,
    chipRadius: 10,
    inputRadius: 10,
    switchRadius: 10,
    previewRadius: 14,
    chipBorderWidth: 1,
    sectionTransparent: true,
    headingUppercase: false,
    labelUppercase: false,
    buttonUppercase: false,
    eyebrowUppercase: true,
    bracketHeaders: false,
    bracketLabels: false,
    dividerOpacity: 0.8,
    dividerWidth: 1,
    buttonPressOpacity: 0.9,
  },
  cyberpunk: {
    cardRadius: 0,
    panelRadius: 0,
    controlRadius: 0,
    chipRadius: 0,
    inputRadius: 4,
    switchRadius: 4,
    previewRadius: 0,
    chipBorderWidth: 1.5,
    sectionTransparent: false,
    headingFontFamily: 'SpaceMono',
    labelFontFamily: 'SpaceMono',
    headingUppercase: true,
    labelUppercase: true,
    buttonUppercase: true,
    eyebrowUppercase: true,
    bracketHeaders: true,
    bracketLabels: true,
    dividerOpacity: 1,
    dividerWidth: 1.4,
    buttonPressOpacity: 0.84,
  },
  glass: {
    cardRadius: 28,
    panelRadius: 30,
    controlRadius: 20,
    chipRadius: 18,
    inputRadius: 20,
    switchRadius: 22,
    previewRadius: 32,
    chipBorderWidth: 1,
    sectionTransparent: false,
    headingUppercase: false,
    labelUppercase: false,
    buttonUppercase: false,
    eyebrowUppercase: false,
    bracketHeaders: false,
    bracketLabels: false,
    dividerOpacity: 0.64,
    dividerWidth: 1,
    buttonPressOpacity: 0.92,
  },
}

const normalizeLabel = (value: string) => value.trim().replace(/\s+/g, ' ')

export const formatBracket = (value: string) => {
  const normalized = normalizeLabel(value)
  return `[${normalized}]`
}

export const asStringChildren = (children: ReactNode): string | null => {
  if (typeof children === 'string') return children
  return null
}

export function useAestheticProfile() {
  const { aesthetic } = useThemePrefs()
  return AESTHETIC_PROFILE[aesthetic]
}

export function GlassEffectLayer({
  radius,
  mode,
  density = 'panel',
  intensity,
}: {
  radius: number
  mode: 'light' | 'dark'
  density?: GlassDensity
  intensity?: number
}) {
  const theme = useTheme()
  const layerColors = getGlassLayerColors(mode, {
    accent: toNativeColor(theme.backdropAccent?.val, mode === 'dark' ? '#9AB8FF' : '#8FC3FF'),
    start: toNativeColor(theme.backdropStart?.val, mode === 'dark' ? '#465A84' : '#CFE2FF'),
  })
  const gradientColors =
    density === 'tab'
      ? layerColors.tab
      : density === 'orb'
        ? layerColors.orb
        : layerColors.panel
  const blurIntensity = intensity ?? getGlassBlurIntensity(mode, density)

  return (
    <>
      <BlurView
        pointerEvents="none"
        intensity={blurIntensity}
        tint={mode === 'dark' ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={gradientColors}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />
    </>
  )
}

type ButtonIcon = React.ComponentProps<typeof Button>['icon']

export const withIconColor = (icon: ButtonIcon, color: string): ButtonIcon => {
  if (!icon || !isValidElement<{ color?: string }>(icon)) return icon
  return cloneElement(icon, { color })
}

export const withNodeColor = (node: ReactNode, color: string) => {
  if (!node || !isValidElement<{ color?: string }>(node)) return node
  return cloneElement(node, { color })
}

export const cardSurfaceProps = {
  bg: '$surfaceCardRaised',
  borderWidth: 1,
  borderColor: '$surfaceCardBorder',
  shadowColor: '$surfaceCardShadow',
  shadowRadius: 18,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
} as const

export const chipSurfaceProps = {
  bg: '$surfaceChip',
  borderWidth: 1,
  borderColor: '$borderSubtle',
} as const
