import { useMemo } from 'react'
import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { useTheme } from 'tamagui'

import { useThemePrefs } from 'components/ThemePrefs'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

export function useRootLayoutTheme() {
  const theme = useTheme()
  const { mode, aesthetic } = useThemePrefs()
  const pageBackground = toNativeColor(theme.surfacePage?.val, FALLBACK_COLORS.surfacePage)
  const chromeBackground = toNativeColor(
    theme.chromeBackground?.val,
    FALLBACK_COLORS.surfacePage
  )
  const chromeTint = toNativeColor(theme.textPrimary?.val, FALLBACK_COLORS.textPrimary)
  const headingFontFamily = aesthetic === 'cyberpunk' ? 'SpaceMono' : 'Inter'

  const navigationTheme = useMemo(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme
    const primary = toNativeColor(theme.accent?.val, base.colors.primary)
    const border = toNativeColor(theme.surfacePanelBorder?.val, base.colors.border)
    return {
      ...base,
      dark: mode === 'dark',
      colors: {
        ...base.colors,
        primary,
        background: pageBackground,
        card: chromeBackground,
        border,
        text: chromeTint,
        notification: primary,
      },
    }
  }, [chromeBackground, chromeTint, mode, pageBackground, theme.accent?.val, theme.surfacePanelBorder?.val])

  return {
    chromeBackground,
    chromeTint,
    headingFontFamily,
    navigationTheme,
    pageBackground,
  }
}
