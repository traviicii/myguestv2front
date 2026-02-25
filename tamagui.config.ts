import { defaultConfig } from '@tamagui/config/v5'
import { createTamagui } from 'tamagui'

const customTokens = {
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    gray1: '#F8FAFC',
    gray2: '#F1F5F9',
    gray3: '#E2E8F0',
    gray4: '#CBD5E1',
    gray5: '#94A3B8',
    gray6: '#64748B',
    gray7: '#475569',
    gray8: '#334155',
    gray9: '#1F2937',
    gray10: '#111827',
    gray11: '#0F172A',
    gray12: '#0B1220',
    green10: '#16A34A',
    orange10: '#F97316',
  },
}

const palettes = {
  studio: {
    light: {
      background: '#F8F8F8',
      color: '#0A0A0A',
      border: '#E0E0E0',
      accent: '#0A0A0A',
      accentMuted: '#F0F0F0',
      accentSoft: '#FAFAFA',
      accentPress: '#000000',
      accentContrast: '#FFFFFF',
    },
    dark: {
      background: '#0A0A0A',
      color: '#FAFAFA',
      border: '#1F1F1F',
      accent: '#FFFFFF',
      accentMuted: '#1A1A1A',
      accentSoft: '#121212',
      accentPress: '#E5E5E5',
      accentContrast: '#0A0A0A',
    },
  },
  slate: {
    light: {
      background: '#F5F7FA',
      color: '#111827',
      border: '#D7DFEA',
      accent: '#0B8F83',
      accentMuted: '#C7F3EA',
      accentSoft: '#E9FBF7',
      accentPress: '#0A6E64',
      accentContrast: '#FFFFFF',
    },
    dark: {
      background: '#0A1018',
      color: '#E6EDF7',
      border: '#1A2433',
      accent: '#23C1B2',
      accentMuted: '#172532',
      accentSoft: '#0F1B26',
      accentPress: '#1BA294',
      accentContrast: '#0A1018',
    },
  },
  sand: {
    light: {
      background: '#FCF8F1',
      color: '#1B120A',
      border: '#E3D5C3',
      accent: '#8B3F0A',
      accentMuted: '#F3E0C8',
      accentSoft: '#FFF1DD',
      accentPress: '#6F3107',
      accentContrast: '#FFFFFF',
    },
    dark: {
      background: '#15110C',
      color: '#F7EEE5',
      border: '#2D2419',
      accent: '#E08B3F',
      accentMuted: '#2A2016',
      accentSoft: '#1D170F',
      accentPress: '#D1762F',
      accentContrast: '#15110C',
    },
  },
}

const makeTheme = (base, palette) => ({
  ...base,
  background: palette.background,
  backgroundHover: palette.background,
  backgroundPress: palette.background,
  backgroundStrong: palette.background,
  color: palette.color,
  colorHover: palette.color,
  colorPress: palette.color,
  borderColor: palette.border,
  borderColorHover: palette.border,
  borderColorPress: palette.border,
  colorFocus: palette.accent,
  borderColorFocus: palette.accentMuted,
  accent: palette.accent,
  accentMuted: palette.accentMuted,
  accentSoft: palette.accentSoft,
  accentPress: palette.accentPress,
  accentContrast: palette.accentContrast,
})

const studioLight = makeTheme(defaultConfig.themes.light, palettes.studio.light)
const studioDark = makeTheme(defaultConfig.themes.dark, palettes.studio.dark)
const slateLight = makeTheme(defaultConfig.themes.light, palettes.slate.light)
const slateDark = makeTheme(defaultConfig.themes.dark, palettes.slate.dark)
const sandLight = makeTheme(defaultConfig.themes.light, palettes.sand.light)
const sandDark = makeTheme(defaultConfig.themes.dark, palettes.sand.dark)

export const config = createTamagui({
  ...defaultConfig,
  tokens: customTokens,
  themes: {
    ...defaultConfig.themes,
    light: studioLight,
    dark: studioDark,
    studio_light: studioLight,
    studio_dark: studioDark,
    slate_light: slateLight,
    slate_dark: slateDark,
    sand_light: sandLight,
    sand_dark: sandDark,
  },
})

export default config

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
