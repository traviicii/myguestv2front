import { defaultConfig } from '@tamagui/config/v5'
import { animations } from '@tamagui/config/v5-rn'
import { createTamagui } from 'tamagui'

import { generatedThemes } from './theme/tamaguiThemeBuilders'

const signalModernLight = generatedThemes.signal_modern_light
const signalModernDark = generatedThemes.signal_modern_dark

export const config = createTamagui({
  ...defaultConfig,
  tokens: defaultConfig.tokens,
  animations,
  themes: {
    ...defaultConfig.themes,
    ...generatedThemes,
    light: signalModernLight,
    dark: signalModernDark,

    signal_light: generatedThemes.signal_modern_light,
    signal_dark: generatedThemes.signal_modern_dark,
    alloy_light: generatedThemes.alloy_modern_light,
    alloy_dark: generatedThemes.alloy_modern_dark,
    pearl_light: generatedThemes.pearl_modern_light,
    pearl_dark: generatedThemes.pearl_modern_dark,

    studio_light: generatedThemes.alloy_modern_light,
    studio_dark: generatedThemes.alloy_modern_dark,
    slate_light: generatedThemes.signal_modern_light,
    slate_dark: generatedThemes.signal_modern_dark,
    sand_light: generatedThemes.pearl_modern_light,
    sand_dark: generatedThemes.pearl_modern_dark,
  },
})

export default config

export type Conf = typeof config

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends Conf {}
}
