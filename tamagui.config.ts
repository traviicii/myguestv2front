import { defaultConfig } from '@tamagui/config/v5'
import { createTamagui } from 'tamagui'

type ThemeMode = 'light' | 'dark'
type ThemePalette = 'signal' | 'alloy' | 'pearl'
type ThemeAesthetic = 'modern' | 'cyberpunk' | 'glass'

type PaletteSeed = {
  background: string
  foreground: string
  border: string
  accent: string
}

const modes: readonly ThemeMode[] = ['light', 'dark']
const aesthetics: readonly ThemeAesthetic[] = ['modern', 'cyberpunk', 'glass']

const paletteSeeds: Record<ThemePalette, Record<ThemeMode, PaletteSeed>> = {
  signal: {
    light: {
      background: '#FFFEEA',
      foreground: '#161707',
      border: '#D2D086',
      accent: '#B7C80D',
    },
    dark: {
      background: '#0D1006',
      foreground: '#F4F8E8',
      border: '#3A4220',
      accent: '#D3E810',
    },
  },
  alloy: {
    light: {
      background: '#F4F5F7',
      foreground: '#13161C',
      border: '#CCD1D9',
      accent: '#2A3340',
    },
    dark: {
      background: '#0D1117',
      foreground: '#E8ECF1',
      border: '#26303D',
      accent: '#A5B2C4',
    },
  },
  pearl: {
    light: {
      background: '#FFF9FC',
      foreground: '#2A1C2B',
      border: '#E9D5E7',
      accent: '#D26DAF',
    },
    dark: {
      background: '#1A121A',
      foreground: '#FCEFFC',
      border: '#4B2E45',
      accent: '#F3A6DE',
    },
  },
}

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(upper, Math.max(lower, value))

const normalizeHex = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed.startsWith('#')) {
    throw new Error(`Expected hex color, received "${value}"`)
  }
  const raw = trimmed.slice(1)
  if (raw.length === 3) {
    return `#${raw
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
      .toUpperCase()}`
  }
  if (raw.length === 6) {
    return `#${raw.toUpperCase()}`
  }
  throw new Error(`Unsupported hex color: "${value}"`)
}

const hexToRgb = (value: string) => {
  const hex = normalizeHex(value).slice(1)
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map((channel) => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`

const mixHex = (left: string, right: string, weight: number) => {
  const ratio = clamp(weight, 0, 1)
  const a = hexToRgb(left)
  const b = hexToRgb(right)
  return rgbToHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  })
}

const withAlpha = (value: string, alpha: number) => {
  const rgb = hexToRgb(value)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`
}

const channelToLinear = (channel: number) => {
  const normalized = channel / 255
  if (normalized <= 0.03928) return normalized / 12.92
  return ((normalized + 0.055) / 1.055) ** 2.4
}

const relativeLuminance = (color: string) => {
  const rgb = hexToRgb(color)
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  )
}

const contrastRatio = (left: string, right: string) => {
  const luminanceLeft = relativeLuminance(left)
  const luminanceRight = relativeLuminance(right)
  const lighter = Math.max(luminanceLeft, luminanceRight)
  const darker = Math.min(luminanceLeft, luminanceRight)
  return (lighter + 0.05) / (darker + 0.05)
}

const assertContrast = (
  label: string,
  foreground: string,
  background: string,
  minimum = 4.5
) => {
  const ratio = contrastRatio(foreground, background)
  if (ratio < minimum) {
    throw new Error(
      `[theme:${label}] Contrast ratio ${ratio.toFixed(2)} is below ${minimum.toFixed(1)}`
    )
  }
}

const makeReadableTone = (
  primary: string,
  background: string,
  minimumRatio: number,
  initialMix: number
) => {
  let candidate = mixHex(primary, background, initialMix)
  for (let index = 0; index < 14; index += 1) {
    if (contrastRatio(candidate, background) >= minimumRatio) {
      return candidate
    }
    candidate = mixHex(candidate, primary, 0.16)
  }
  return primary
}

const normalizeAccentPair = (accent: string) => {
  const darkText = '#0A1018'
  const lightText = '#FFFFFF'
  let background = normalizeHex(accent)
  let foreground =
    contrastRatio(lightText, background) >= contrastRatio(darkText, background)
      ? lightText
      : darkText

  for (let index = 0; index < 14; index += 1) {
    if (contrastRatio(foreground, background) >= 4.5) {
      break
    }

    background =
      foreground === lightText
        ? mixHex(background, '#000000', 0.08)
        : mixHex(background, '#FFFFFF', 0.08)
  }

  return { background, foreground }
}

const pickReadableForeground = (background: string, preferred: string) => {
  if (contrastRatio(preferred, background) >= 4.5) {
    return preferred
  }
  const darkText = '#0A1018'
  const lightText = '#FFFFFF'
  return contrastRatio(lightText, background) >= contrastRatio(darkText, background)
    ? lightText
    : darkText
}

const buildSemanticPalette = (
  seed: PaletteSeed,
  palette: ThemePalette,
  aesthetic: ThemeAesthetic,
  mode: ThemeMode
) => {
  const variantLabel = `${palette}_${aesthetic}_${mode}`
  const isDark = mode === 'dark'
  let accent = seed.accent

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
      signal: '#BCFF2A',
      alloy: '#C7D4EA',
      pearl: '#FFAFE6',
    }
    accent = mixHex(seed.accent, glassMap[palette], isDark ? 0.56 : 0.58)
  }

  if (aesthetic === 'modern') {
    const modernAccentMap: Record<ThemePalette, string> = {
      signal: '#3467D6',
      alloy: '#566277',
      pearl: '#CA82B9',
    }
    const modernMixByPalette: Record<ThemePalette, number> = {
      signal: isDark ? 0.64 : 0.52,
      alloy: isDark ? 0.28 : 0.2,
      pearl: isDark ? 0.66 : 0.56,
    }
    accent = mixHex(seed.accent, modernAccentMap[palette], modernMixByPalette[palette])
  }

  let surfacePage = seed.background
  if (aesthetic === 'modern' && palette === 'signal') {
    surfacePage = isDark ? '#0D1322' : '#F5F8FF'
  }
  if (aesthetic === 'modern' && palette === 'pearl') {
    surfacePage = isDark ? '#1A1320' : '#FFF8FD'
  }
  if (aesthetic === 'glass' && !isDark) {
    const glassLightPages: Record<ThemePalette, string> = {
      signal: '#F7FFE6',
      alloy: '#EFF2FF',
      pearl: '#FFF0F7',
    }
    surfacePage = glassLightPages[palette]
  }

  const initialAccentPair = normalizeAccentPair(accent)
  accent = initialAccentPair.background

  const neutralTint = isDark ? '#F2F2F2' : '#111111'
  let textPrimary = seed.foreground
  if (aesthetic === 'modern' && palette === 'signal') {
    textPrimary = isDark ? '#EAF0FF' : '#15203A'
  }
  if (aesthetic === 'modern' && palette === 'pearl') {
    textPrimary = isDark ? '#F8EAF5' : '#2B1F31'
  }

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
      // Acid yellow profile with near-black scaffold.
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
      // Monochrome cyberpunk profile: stark graphite + white edges.
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

  if (aesthetic === 'modern') {
    surfaceCard = 'transparent'
    surfaceCardRaised = 'transparent'
    surfaceCardBorder = 'transparent'
    surfaceCardShadow = 'transparent'
    surfacePreview = mixHex(surfacePage, neutralTint, isDark ? 0.12 : 0.05)
    surfacePanel = mixHex(surfacePage, neutralTint, isDark ? 0.14 : 0.07)
    surfacePanelBorder = mixHex(borderStrong, surfacePage, 0.24)
    surfacePanelShadow = 'transparent'
    backdropStart = mixHex(surfacePage, accent, isDark ? 0.1 : 0.04)
    backdropAccent = mixHex(accent, surfacePage, isDark ? 0.75 : 0.82)
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
          start: '#C4F25A',
          end: '#F5FFDE',
          accent: '#7FD12B',
        },
        alloy: {
          start: '#95AEF3',
          end: '#ECF1FF',
          accent: '#6E87CD',
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
  const buttonPrimaryBgPress = isDark
    ? mixHex(buttonPrimaryBg, '#FFFFFF', 0.14)
    : mixHex(buttonPrimaryBg, '#000000', 0.16)

  let buttonSecondaryBg =
    aesthetic === 'modern' ? mixHex(surfacePage, neutralTint, isDark ? 0.1 : 0.04) : surfacePanel
  let buttonSecondaryFg = pickReadableForeground(buttonSecondaryBg, textPrimary)
  let buttonSecondaryBorder = surfacePanelBorder
  if (aesthetic === 'cyberpunk' && palette === 'alloy' && isDark) {
    buttonSecondaryBg = '#000000'
    buttonSecondaryFg = '#FFFFFF'
    buttonSecondaryBorder = '#FFFFFF'
  }
  const buttonSecondaryBgPress = mixHex(buttonSecondaryBg, accent, isDark ? 0.24 : 0.12)

  let surfaceChip =
    aesthetic === 'modern'
      ? mixHex(surfacePage, neutralTint, isDark ? 0.07 : 0.02)
      : surfaceCard
  let surfaceChipActive = mixHex(accent, surfacePage, isDark ? 0.66 : 0.84)
  if (aesthetic === 'cyberpunk' && palette === 'alloy' && isDark) {
    surfaceChip = '#0F1114'
    surfaceChipActive = '#1B1E23'
  }
  const surfaceFieldActive = mixHex(surfaceField, accent, isDark ? 0.24 : 0.12)

  let surfaceSecondary = buttonSecondaryBg
  let surfaceSecondaryBorder = buttonSecondaryBorder
  let surfaceSecondaryPress = buttonSecondaryBgPress
  let surfaceTabGlass = surfacePanel
  let surfaceTabGlassBorder = surfacePanelBorder
  let surfaceTabGlassShadow = surfacePanelShadow

  if (aesthetic === 'glass') {
    surfaceSecondary = mixHex(buttonSecondaryBg, '#FFFFFF', isDark ? 0 : 0.1)
    surfaceSecondaryBorder = isDark
      ? 'rgba(255, 255, 255, 0)'
      : mixHex(buttonSecondaryBorder, '#FFFFFF', 0.14)
    surfaceSecondaryPress = mixHex(surfaceSecondary, accent, isDark ? 0.12 : 0.16)
    surfaceTabGlass = mixHex(surfacePanel, isDark ? accent : '#FFFFFF', isDark ? 0.06 : 0.2)
    surfaceTabGlassBorder = isDark
      ? 'rgba(255, 255, 255, 0)'
      : mixHex(surfacePanelBorder, '#FFFFFF', 0.2)
    surfaceTabGlassShadow = withAlpha(mixHex(seed.foreground, accent, 0.34), isDark ? 0.4 : 0.3)
  }

  const switchTrackOn = buttonPrimaryBg
  const switchTrackOff = mixHex(surfacePage, textPrimary, isDark ? 0.24 : 0.1)
  const switchTrackBorder = borderStrong
  const switchThumb = isDark ? '#F8FBFF' : '#FFFFFF'

  const focusRing = mixHex(accent, '#FFFFFF', isDark ? 0.2 : 0.3)
  const divider = mixHex(borderSubtle, surfacePage, 0.34)

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
      aesthetic === 'modern' ? mixHex(surfacePage, neutralTint, isDark ? 0.06 : 0.02) : surfacePanel,
    chromeTintActive: accent,
    chromeTintInactive: textMuted,
    overlayStrong: 'rgba(0, 0, 0, 0.85)',
    overlaySoft: 'rgba(0, 0, 0, 0.6)',
    overlayControl: 'rgba(0, 0, 0, 0.55)',
    backdropStart,
    backdropEnd,
    backdropAccent,
    accent,
    accentMuted: surfaceChipActive,
    accentSoft: mixHex(surfaceChipActive, surfacePage, isDark ? 0.24 : 0.38),
    accentPress: buttonPrimaryBgPress,
    accentContrast: buttonPrimaryFg,
  }
}

const makeTheme = (
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

const generatedThemes: Record<string, ReturnType<typeof makeTheme>> = {}

for (const [paletteName, modeMap] of Object.entries(paletteSeeds) as Array<
  [ThemePalette, Record<ThemeMode, PaletteSeed>]
>) {
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

const signalModernLight = generatedThemes.signal_modern_light
const signalModernDark = generatedThemes.signal_modern_dark

export const config = createTamagui({
  ...defaultConfig,
  tokens: defaultConfig.tokens,
  themes: {
    ...defaultConfig.themes,
    ...generatedThemes,
    light: signalModernLight,
    dark: signalModernDark,

    // Current aliases
    signal_light: generatedThemes.signal_modern_light,
    signal_dark: generatedThemes.signal_modern_dark,
    alloy_light: generatedThemes.alloy_modern_light,
    alloy_dark: generatedThemes.alloy_modern_dark,
    pearl_light: generatedThemes.pearl_modern_light,
    pearl_dark: generatedThemes.pearl_modern_dark,

    // Backward-compatible aliases for previously persisted names
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
  interface TamaguiCustomConfig extends Conf {}
}
