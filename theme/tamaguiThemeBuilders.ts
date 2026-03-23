import { defaultConfig } from '@tamagui/config/v5'

import {
  assertContrast,
  makeReadableTone,
  mixHex,
  normalizeAccentPair,
  pickReadableForeground,
  withAlpha,
} from './tamaguiColorUtils'
import {
  aesthetics,
  modes,
  paletteSeeds,
  type PaletteSeed,
  type ThemeAesthetic,
  type ThemeMode,
  type ThemePalette,
} from './tamaguiThemeTypes'

type ModernPaletteSpec = {
  accent: string
  accentSoft: string
  border: string
  page: string
  panel: string
  secondary: string
  text: string
}

const MODERN_PALETTE_SPECS: Record<
  ThemePalette,
  Record<ThemeMode, ModernPaletteSpec>
> = {
  signal: {
    light: {
      page: '#FFFDF2',
      panel: '#FFFFFF',
      text: '#17180F',
      secondary: '#62664A',
      border: '#E8E7C8',
      accent: '#CADB22',
      accentSoft: '#F7FAD8',
    },
    dark: {
      page: '#12130F',
      panel: '#181915',
      text: '#F7F8F0',
      secondary: '#BCC39E',
      border: '#3A3B30',
      accent: '#D9F047',
      accentSoft: '#282A18',
    },
  },
  alloy: {
    light: {
      page: '#F5F5F4',
      panel: '#FFFFFF',
      text: '#111214',
      secondary: '#5D6064',
      border: '#DADBDD',
      accent: '#202226',
      accentSoft: '#F1F2F4',
    },
    dark: {
      page: '#0F1012',
      panel: '#17181B',
      text: '#F5F5F6',
      secondary: '#B5B7BB',
      border: '#303236',
      accent: '#ECEDEF',
      accentSoft: '#24262A',
    },
  },
  pearl: {
    light: {
      page: '#FFF7FA',
      panel: '#FFFFFF',
      text: '#261A20',
      secondary: '#735A67',
      border: '#EED9E3',
      accent: '#EA92B7',
      accentSoft: '#FCE6EF',
    },
    dark: {
      page: '#181116',
      panel: '#22181E',
      text: '#FBF1F5',
      secondary: '#C6AAB7',
      border: '#47303A',
      accent: '#F2A9C7',
      accentSoft: '#2D1E26',
    },
  },
}

export const buildSemanticPalette = (
  seed: PaletteSeed,
  palette: ThemePalette,
  aesthetic: ThemeAesthetic,
  mode: ThemeMode
) => {
  const variantLabel = `${palette}_${aesthetic}_${mode}`
  const isDark = mode === 'dark'
  const modernSpec = aesthetic === 'modern' ? MODERN_PALETTE_SPECS[palette][mode] : null
  let accent = modernSpec?.accent ?? seed.accent

  if (aesthetic === 'cyberpunk') {
    const neonMap: Record<ThemePalette, string> = {
      signal: '#D9FF00',
      alloy: '#F4F6F8',
      pearl: '#FF69CC',
    }
    const neonMixByPalette: Record<ThemePalette, number> = {
      signal: isDark ? 0.82 : 0.68,
      alloy: isDark ? 0.76 : 0.6,
      pearl: isDark ? 0.66 : 0.52,
    }
    accent = mixHex(seed.accent, neonMap[palette], neonMixByPalette[palette])
  }

  if (aesthetic === 'glass') {
    const glassMap: Record<ThemePalette, string> = {
      signal: '#D7E85A',
      alloy: '#C7D4EA',
      pearl: '#FFAFE6',
    }
    accent = mixHex(seed.accent, glassMap[palette], isDark ? 0.56 : 0.58)
    if (!isDark && palette === 'alloy') {
      accent = mixHex(seed.accent, glassMap[palette], 0.7)
    }
  }

  let surfacePage = modernSpec?.page ?? seed.background
  if (aesthetic === 'glass' && !isDark) {
    const glassLightPages: Record<ThemePalette, string> = {
      signal: '#FFFDF1',
      alloy: '#F4F4F4',
      pearl: '#FFF0F7',
    }
    surfacePage = glassLightPages[palette]
  }

  const initialAccentPair = normalizeAccentPair(accent)
  accent = initialAccentPair.background

  const neutralTint = isDark ? '#F2F2F2' : '#111111'
  let textPrimary = modernSpec?.text ?? seed.foreground

  let textSecondary = makeReadableTone(
    textPrimary,
    surfacePage,
    4.7,
    isDark ? 0.44 : 0.55
  )
  let textMuted = makeReadableTone(
    textPrimary,
    surfacePage,
    4.5,
    isDark ? 0.58 : 0.68
  )

  let surfaceCard = mixHex(surfacePage, neutralTint, isDark ? 0.08 : 0.04)
  let surfaceCardRaised = mixHex(surfacePage, neutralTint, isDark ? 0.12 : 0.07)
  let surfacePreview = mixHex(surfacePage, neutralTint, isDark ? 0.16 : 0.1)
  let surfaceField = mixHex(surfacePage, neutralTint, isDark ? 0.1 : 0.04)
  let surfacePanel = mixHex(surfacePage, neutralTint, isDark ? 0.14 : 0.08)
  let borderSubtle = mixHex(seed.border, surfacePage, isDark ? 0.22 : 0.12)
  let borderStrong = mixHex(seed.border, neutralTint, isDark ? 0.28 : 0.16)
  let surfaceCardBorder = borderSubtle
  let surfacePanelBorder = borderStrong
  let surfaceCardShadow = withAlpha(mixHex(seed.foreground, accent, 0.2), isDark ? 0.34 : 0.12)
  let surfacePanelShadow = withAlpha(mixHex(seed.foreground, accent, 0.26), isDark ? 0.38 : 0.16)

  let backdropStart = mixHex(surfacePage, accent, isDark ? 0.16 : 0.08)
  let backdropEnd = surfacePage
  let backdropAccent = mixHex(accent, surfacePage, isDark ? 0.62 : 0.74)

  if (aesthetic === 'cyberpunk') {
    surfaceCard = mixHex(surfaceCard, accent, isDark ? 0.26 : 0.16)
    surfaceCardRaised = mixHex(surfaceCardRaised, accent, isDark ? 0.34 : 0.22)
    surfacePreview = mixHex(surfacePreview, accent, isDark ? 0.42 : 0.28)
    surfacePanel = mixHex(surfacePanel, accent, isDark ? 0.4 : 0.24)
    surfaceField = mixHex(surfaceField, accent, isDark ? 0.28 : 0.14)
    borderSubtle = mixHex(borderSubtle, accent, isDark ? 0.58 : 0.42)
    borderStrong = mixHex(borderStrong, accent, isDark ? 0.72 : 0.55)
    surfaceCardBorder = borderStrong
    surfacePanelBorder = mixHex(borderStrong, '#FFFFFF', isDark ? 0.08 : 0.2)
    surfaceCardShadow = withAlpha(accent, isDark ? 0.48 : 0.28)
    surfacePanelShadow = withAlpha(accent, isDark ? 0.55 : 0.34)
    backdropStart = mixHex(surfacePage, accent, isDark ? 0.52 : 0.3)
    backdropAccent = mixHex(accent, '#D9FF00', isDark ? 0.34 : 0.24)

    if (palette === 'signal') {
      accent = isDark ? '#D9FF00' : '#748700'
      surfaceCard = mixHex(surfaceCard, '#080903', isDark ? 0.34 : 0.14)
      surfaceCardRaised = mixHex(surfaceCardRaised, '#080903', isDark ? 0.28 : 0.1)
      surfacePanel = mixHex(surfacePanel, '#080903', isDark ? 0.32 : 0.14)
      borderSubtle = mixHex(borderSubtle, '#D9FF00', isDark ? 0.62 : 0.5)
      borderStrong = mixHex(borderStrong, '#D9FF00', isDark ? 0.76 : 0.66)
      surfaceCardBorder = borderStrong
      surfacePanelBorder = borderStrong
      backdropStart = mixHex(surfacePage, '#D9FF00', isDark ? 0.68 : 0.44)
      backdropAccent = mixHex('#D9FF00', '#F2FF99', isDark ? 0.32 : 0.18)
      if (!isDark) {
        textSecondary = '#2A2E10'
        textMuted = '#3B4120'
      }
    }

    if (palette === 'alloy') {
      accent = isDark ? '#FFFFFF' : '#12161D'
      if (isDark) {
        surfacePage = '#090A0B'
        textPrimary = '#F5F7FA'
        textSecondary = '#CDD1D7'
        textMuted = '#9CA3AD'
      }
      surfaceCard = mixHex(surfacePage, '#FFFFFF', isDark ? 0.06 : 0.02)
      surfaceCardRaised = mixHex(surfacePage, '#FFFFFF', isDark ? 0.1 : 0.04)
      surfacePreview = mixHex(surfacePage, '#FFFFFF', isDark ? 0.14 : 0.06)
      surfacePanel = mixHex(surfacePage, '#FFFFFF', isDark ? 0.12 : 0.05)
      surfaceField = mixHex(surfacePage, '#FFFFFF', isDark ? 0.08 : 0.03)
      borderSubtle = isDark ? '#4E545D' : mixHex(seed.border, '#AEB5BE', 0.34)
      borderStrong = isDark ? '#FFFFFF' : '#22262D'
      surfaceCardBorder = borderStrong
      surfacePanelBorder = borderStrong
      surfaceCardShadow = withAlpha('#FFFFFF', isDark ? 0.24 : 0.12)
      surfacePanelShadow = withAlpha('#FFFFFF', isDark ? 0.3 : 0.16)
      backdropStart = mixHex(surfacePage, '#FFFFFF', isDark ? 0.16 : 0.08)
      backdropAccent = mixHex(accent, isDark ? '#FFFFFF' : '#171A1F', 0.42)
    }
  }

  if (aesthetic === 'modern' && modernSpec) {
    textSecondary = modernSpec.secondary
    textMuted = makeReadableTone(
      modernSpec.secondary,
      surfacePage,
      4.5,
      isDark ? 0.12 : 0.16
    )

    borderSubtle = modernSpec.border
    borderStrong = mixHex(modernSpec.border, textPrimary, isDark ? 0.16 : 0.12)

    surfaceCard = modernSpec.panel
    surfaceCardRaised = mixHex(
      modernSpec.panel,
      isDark ? '#FFFFFF' : '#000000',
      isDark ? 0.03 : 0.015
    )
    surfacePreview = mixHex(
      modernSpec.panel,
      modernSpec.accentSoft,
      isDark ? 0.32 : 0.18
    )
    surfaceField = mixHex(modernSpec.panel, textPrimary, isDark ? 0.1 : 0.035)
    surfacePanel = modernSpec.panel
    surfaceCardBorder = borderSubtle
    surfacePanelBorder = mixHex(borderStrong, modernSpec.panel, isDark ? 0.04 : 0.08)
    surfaceCardShadow = withAlpha(mixHex(textPrimary, accent, 0.14), isDark ? 0.2 : 0.08)
    surfacePanelShadow = withAlpha(mixHex(textPrimary, accent, 0.18), isDark ? 0.24 : 0.1)
    backdropStart = mixHex(surfacePage, modernSpec.accentSoft, isDark ? 0.44 : 0.58)
    backdropEnd = mixHex(surfacePage, modernSpec.panel, isDark ? 0.18 : 0.08)
    backdropAccent = mixHex(accent, modernSpec.accentSoft, isDark ? 0.4 : 0.32)
  }

  if (aesthetic === 'glass') {
    surfaceCard = mixHex(surfacePage, '#FFFFFF', isDark ? 0.02 : 0.32)
    surfaceCardRaised = mixHex(surfacePage, '#FFFFFF', isDark ? 0.05 : 0.4)
    surfacePreview = mixHex(surfacePage, '#FFFFFF', isDark ? 0.1 : 0.52)
    surfacePanel = mixHex(surfacePage, '#FFFFFF', isDark ? 0.07 : 0.44)
    surfaceField = mixHex(surfacePage, '#FFFFFF', isDark ? 0.06 : 0.56)
    borderSubtle = mixHex(seed.border, '#FFFFFF', isDark ? 0.02 : 0.34)
    borderStrong = mixHex(seed.border, accent, isDark ? 0.4 : 0.26)
    surfaceCardBorder = isDark
      ? 'rgba(255, 255, 255, 0)'
      : mixHex(borderStrong, '#FFFFFF', 0.18)
    surfacePanelBorder = isDark
      ? 'rgba(255, 255, 255, 0)'
      : mixHex(borderStrong, '#FFFFFF', 0.24)
    surfaceCardShadow = withAlpha(mixHex(seed.foreground, accent, 0.28), isDark ? 0.26 : 0.2)
    surfacePanelShadow = withAlpha(mixHex(seed.foreground, accent, 0.32), isDark ? 0.3 : 0.24)
    backdropStart = mixHex(surfacePage, accent, isDark ? 0.26 : 0.34)
    backdropEnd = mixHex(surfacePage, '#FFFFFF', isDark ? 0.04 : 0.1)
    backdropAccent = mixHex(accent, '#FFFFFF', isDark ? 0.28 : 0.16)

    if (!isDark) {
      const glassLightBackdropByPalette: Record<
        ThemePalette,
        { start: string; end: string; accent: string }
      > = {
        signal: {
          start: '#D3E56A',
          end: '#FBFDEA',
          accent: '#C9DB4A',
        },
        alloy: {
          start: '#BFC4CD',
          end: '#FAFAFA',
          accent: '#6F757F',
        },
        pearl: {
          start: '#F7AED8',
          end: '#FFE6D7',
          accent: '#E989C0',
        },
      }

      backdropStart = glassLightBackdropByPalette[palette].start
      backdropEnd = glassLightBackdropByPalette[palette].end
      backdropAccent = glassLightBackdropByPalette[palette].accent
    }
  }

  const accentPair = normalizeAccentPair(accent)
  accent = accentPair.background
  let chromeTintActive = accent
  let chromeTintInactive = textMuted

  if (aesthetic === 'modern' && modernSpec) {
    chromeTintActive = accent
    chromeTintInactive = textSecondary
  }

  let buttonPrimaryBg = accent
  let buttonPrimaryFg = accentPair.foreground
  if (aesthetic === 'cyberpunk' && palette === 'signal' && !isDark) {
    buttonPrimaryBg = '#C8EA00'
    buttonPrimaryFg = normalizeAccentPair(buttonPrimaryBg).foreground
  }
  if (aesthetic === 'cyberpunk' && palette === 'alloy' && isDark) {
    buttonPrimaryBg = '#FFFFFF'
    buttonPrimaryFg = '#000000'
  }
  let buttonPrimaryBgPress = isDark
    ? mixHex(buttonPrimaryBg, '#FFFFFF', 0.14)
    : mixHex(buttonPrimaryBg, '#000000', 0.16)
  let buttonPrimaryBorder = buttonPrimaryBg
  let buttonPrimaryBorderPress = buttonPrimaryBgPress

  let buttonSecondaryBg =
    aesthetic === 'modern' ? mixHex(surfacePage, neutralTint, isDark ? 0.1 : 0.04) : surfacePanel
  let buttonSecondaryFg = pickReadableForeground(buttonSecondaryBg, textPrimary)
  let buttonSecondaryBorder = surfacePanelBorder
  if (aesthetic === 'cyberpunk' && palette === 'alloy' && isDark) {
    buttonSecondaryBg = '#000000'
    buttonSecondaryFg = '#FFFFFF'
    buttonSecondaryBorder = '#FFFFFF'
  }
  let buttonSecondaryBgPress = mixHex(buttonSecondaryBg, accent, isDark ? 0.24 : 0.12)

  if (aesthetic === 'modern' && modernSpec) {
    buttonPrimaryBg = accent
    buttonPrimaryFg = pickReadableForeground(buttonPrimaryBg, textPrimary)
    buttonPrimaryBorder = mixHex(accent, surfacePage, isDark ? 0.18 : 0.08)
    buttonPrimaryBgPress = mixHex(buttonPrimaryBg, isDark ? '#FFFFFF' : '#000000', isDark ? 0.16 : 0.12)
    buttonPrimaryBorderPress = mixHex(buttonPrimaryBorder, buttonPrimaryBgPress, 0.36)

    buttonSecondaryBg = surfacePanel
    buttonSecondaryFg = textPrimary
    buttonSecondaryBorder = surfacePanelBorder
    buttonSecondaryBgPress = mixHex(surfacePanel, accent, isDark ? 0.18 : 0.08)
  }

  if (aesthetic === 'glass' && palette === 'signal' && !isDark) {
    chromeTintActive = mixHex(accent, '#000000', 0.62)
    chromeTintInactive = mixHex(accent, '#000000', 0.45)
  }

  if (aesthetic === 'glass' && !isDark) {
    buttonPrimaryBg = mixHex(accent, surfacePage, 0.22)
    buttonPrimaryFg = pickReadableForeground(buttonPrimaryBg, textPrimary)
    buttonPrimaryBorder = mixHex(accent, '#FFFFFF', 0.55)
    buttonPrimaryBgPress = mixHex(buttonPrimaryBg, accent, 0.12)
    buttonPrimaryBorderPress = mixHex(buttonPrimaryBorder, accent, 0.18)

    buttonSecondaryBg = mixHex(surfacePage, '#FFFFFF', 0.08)
    buttonSecondaryBorder = mixHex(surfacePanelBorder, '#FFFFFF', 0.55)
    buttonSecondaryFg = pickReadableForeground(buttonSecondaryBg, accent)
    buttonSecondaryBgPress = mixHex(buttonSecondaryBg, accent, 0.1)
  }

  let surfaceChip =
    aesthetic === 'modern'
      ? mixHex(surfacePage, neutralTint, isDark ? 0.07 : 0.02)
      : surfaceCard
  let surfaceChipActive = mixHex(accent, surfacePage, isDark ? 0.66 : 0.84)
  if (aesthetic === 'cyberpunk' && palette === 'alloy' && isDark) {
    surfaceChip = '#0F1114'
    surfaceChipActive = '#1B1E23'
  }
  if (aesthetic === 'modern' && modernSpec) {
    surfaceChip = mixHex(surfacePanel, textPrimary, isDark ? 0.06 : 0.025)
    surfaceChipActive = modernSpec.accentSoft
  }
  const surfaceFieldActive = mixHex(surfaceField, accent, isDark ? 0.24 : 0.12)

  let surfaceSecondary = buttonSecondaryBg
  let surfaceSecondaryBorder = buttonSecondaryBorder
  let surfaceSecondaryPress = buttonSecondaryBgPress
  let surfaceTabGlass = surfacePanel
  let surfaceTabGlassBorder = surfacePanelBorder
  let surfaceTabGlassShadow = surfacePanelShadow

  if (aesthetic === 'glass') {
    surfaceSecondary = mixHex(surfacePanel, '#FFFFFF', isDark ? 0 : 0.1)
    surfaceSecondaryBorder = isDark
      ? 'rgba(255, 255, 255, 0)'
      : mixHex(surfacePanelBorder, '#FFFFFF', 0.14)
    surfaceSecondaryPress = mixHex(surfaceSecondary, accent, isDark ? 0.12 : 0.16)
    surfaceTabGlass = mixHex(surfacePanel, isDark ? accent : '#FFFFFF', isDark ? 0.06 : 0.2)
    surfaceTabGlassBorder = isDark
      ? 'rgba(255, 255, 255, 0)'
      : mixHex(surfacePanelBorder, '#FFFFFF', 0.2)
    surfaceTabGlassShadow = withAlpha(mixHex(seed.foreground, accent, 0.34), isDark ? 0.4 : 0.3)
  }

  const switchTrackOn = buttonPrimaryBg
  const switchTrackOff =
    aesthetic === 'modern' && modernSpec
      ? mixHex(surfacePanel, textPrimary, isDark ? 0.18 : 0.08)
      : mixHex(surfacePage, textPrimary, isDark ? 0.24 : 0.1)
  const switchTrackBorder = borderStrong
  const switchThumb = isDark ? '#F8FBFF' : '#FFFFFF'

  const focusRing =
    aesthetic === 'modern' && modernSpec
      ? mixHex(accent, isDark ? '#FFFFFF' : '#EAF0FF', isDark ? 0.18 : 0.42)
      : mixHex(accent, '#FFFFFF', isDark ? 0.2 : 0.3)
  const divider =
    aesthetic === 'modern' && modernSpec
      ? mixHex(borderSubtle, surfacePage, isDark ? 0.12 : 0.18)
      : mixHex(borderSubtle, surfacePage, 0.34)

  assertContrast(`${variantLabel}:textPrimary/background`, textPrimary, surfacePage)
  assertContrast(`${variantLabel}:textSecondary/background`, textSecondary, surfacePage)
  assertContrast(
    `${variantLabel}:buttonPrimaryFg/buttonPrimaryBg`,
    buttonPrimaryFg,
    buttonPrimaryBg
  )
  assertContrast(
    `${variantLabel}:buttonSecondaryFg/buttonSecondaryBg`,
    buttonSecondaryFg,
    buttonSecondaryBg
  )
  assertContrast(`${variantLabel}:textPrimary/surfaceSecondary`, textPrimary, surfaceSecondary)
  assertContrast(`${variantLabel}:textPrimary/surfaceTabGlass`, textPrimary, surfaceTabGlass)

  return {
    textPrimary,
    textSecondary,
    textMuted,
    textOnAccent: buttonPrimaryFg,
    surfacePage,
    surfaceCard,
    surfaceCardRaised,
    surfaceCardBorder,
    surfaceCardShadow,
    surfacePanel,
    surfacePanelBorder,
    surfacePanelShadow,
    surfaceSecondary,
    surfaceSecondaryBorder,
    surfaceSecondaryPress,
    surfaceTabGlass,
    surfaceTabGlassBorder,
    surfaceTabGlassShadow,
    surfacePreview,
    surfaceField,
    surfaceFieldActive,
    surfaceChip,
    surfaceChipActive,
    borderSubtle,
    borderStrong,
    borderAccent: mixHex(borderStrong, accent, 0.5),
    divider,
    buttonPrimaryBg,
    buttonPrimaryBgPress,
    buttonPrimaryBorder,
    buttonPrimaryBorderPress,
    buttonPrimaryFg,
    buttonSecondaryBg,
    buttonSecondaryBgPress,
    buttonSecondaryFg,
    buttonSecondaryBorder,
    switchTrackOn,
    switchTrackOff,
    switchTrackBorder,
    switchThumb,
    focusRing,
    danger: '#DC2626',
    dangerSoft: isDark ? '#3D1313' : '#FEE2E2',
    shadowColor: surfaceCardShadow,
    chromeBackground:
      aesthetic === 'modern'
        ? mixHex(surfacePage, surfacePanel, isDark ? 0.8 : 0.54)
        : surfacePanel,
    chromeTintActive,
    chromeTintInactive,
    overlayStrong: 'rgba(0, 0, 0, 0.85)',
    overlaySoft: 'rgba(0, 0, 0, 0.6)',
    overlayControl: 'rgba(0, 0, 0, 0.55)',
    backdropStart,
    backdropEnd,
    backdropAccent,
    accent,
    accentMuted: surfaceChipActive,
    accentSoft:
      aesthetic === 'modern' && modernSpec
        ? modernSpec.accentSoft
        : mixHex(surfaceChipActive, surfacePage, isDark ? 0.24 : 0.38),
    accentPress: buttonPrimaryBgPress,
    accentContrast: buttonPrimaryFg,
  }
}

export const makeTheme = (
  base: typeof defaultConfig.themes.light,
  paletteName: ThemePalette,
  seed: PaletteSeed,
  aesthetic: ThemeAesthetic,
  mode: ThemeMode
) => {
  const semantic = buildSemanticPalette(seed, paletteName, aesthetic, mode)

  return {
    ...base,
    background: semantic.surfacePage,
    backgroundHover: semantic.surfaceCard,
    backgroundPress: semantic.surfaceCardRaised,
    color: semantic.textPrimary,
    colorHover: semantic.textPrimary,
    colorPress: semantic.textPrimary,
    borderColor: semantic.borderSubtle,
    borderColorHover: semantic.borderStrong,
    borderColorPress: semantic.borderStrong,
    colorFocus: semantic.focusRing,
    borderColorFocus: semantic.focusRing,
    ...semantic,
  }
}

export const generatedThemes: Record<string, ReturnType<typeof makeTheme>> = {}

for (const [paletteName, modeMap] of Object.entries(paletteSeeds) as [
  ThemePalette,
  Record<ThemeMode, PaletteSeed>,
][]) {
  for (const aesthetic of aesthetics) {
    for (const mode of modes) {
      const key = `${paletteName}_${aesthetic}_${mode}`
      generatedThemes[key] = makeTheme(
        defaultConfig.themes[mode],
        paletteName,
        modeMap[mode],
        aesthetic,
        mode
      )
    }
  }
}
