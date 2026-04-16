import { RefreshControl, type RefreshControlProps } from 'react-native'
import { useTheme } from 'tamagui'

import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

export function ThemedRefreshControl(props: RefreshControlProps) {
  const theme = useTheme()
  const accentColor = toNativeColor(theme.accent?.val, FALLBACK_COLORS.glassAccentLight)
  const surfaceColor = toNativeColor(
    theme.surfaceCard?.val,
    FALLBACK_COLORS.surfacePage
  )

  return (
    <RefreshControl
      tintColor={accentColor}
      colors={[accentColor]}
      progressBackgroundColor={surfaceColor}
      {...props}
    />
  )
}
