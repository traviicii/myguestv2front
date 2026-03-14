import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text, useTheme } from 'tamagui'

import { useThemePrefs } from '../ThemePrefs'
import { toNativeColor } from 'components/utils/color'
import { getGlassLayerColors } from './glassStyle'
import { asStringChildren, useAestheticProfile } from './controlShared'

type ButtonLabelProps = {
  children: string
  color: React.ComponentProps<typeof Text>['color']
  uppercase: boolean
  fontFamily?: string
}

export function ButtonLabel({ children, color, uppercase, fontFamily }: ButtonLabelProps) {
  return (
    <Text
      color={color}
      fontWeight="700"
      letterSpacing={uppercase ? 0.8 : 0}
      textTransform={uppercase ? 'uppercase' : undefined}
      style={fontFamily ? ({ fontFamily } as never) : undefined}
    >
      {children}
    </Text>
  )
}

export function useResolvedButtonChildren({
  children,
  color,
}: {
  children: React.ReactNode
  color: React.ComponentProps<typeof Text>['color']
}) {
  const profile = useAestheticProfile()
  const stringChildren = asStringChildren(children)

  if (stringChildren === null) {
    return children
  }

  return (
    <ButtonLabel
      color={color}
      uppercase={profile.buttonUppercase}
      fontFamily={profile.labelFontFamily}
    >
      {stringChildren}
    </ButtonLabel>
  )
}

export function useGlassButtonLayerColors(layer: 'primary' | 'secondary') {
  const theme = useTheme()
  const { aesthetic, mode } = useThemePrefs()
  const isGlassLight = aesthetic === 'glass' && mode === 'light'
  const layerColors = isGlassLight
    ? getGlassLayerColors('light', {
        accent: toNativeColor(theme.backdropAccent?.val, '#8FC3FF'),
        start: toNativeColor(theme.backdropStart?.val, '#CFE2FF'),
      })
    : null

  return {
    colors: layer === 'primary' ? layerColors?.tab : layerColors?.panel,
    isGlassLight,
  }
}

export function GlassButtonLayer({
  colors,
  opacity,
  radius,
  start,
  end,
}: {
  colors?: readonly [string, string, string]
  opacity: number
  radius: number
  start: { x: number; y: number }
  end: { x: number; y: number }
}) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={
        colors ?? ([
          'rgba(255, 255, 255, 0.35)',
          'rgba(255, 255, 255, 0.05)',
          'rgba(255, 255, 255, 0.2)',
        ] as const)
      }
      start={start}
      end={end}
      style={[StyleSheet.absoluteFillObject, { borderRadius: radius, opacity }]}
    />
  )
}
