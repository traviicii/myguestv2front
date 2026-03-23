import type {
  ThemeAesthetic,
  ThemeMode,
  ThemeModePreference,
  ThemePalette,
} from 'components/ThemePrefs'
import { getThemeName } from 'components/ThemePrefs'

export type ThemeDraft = {
  aesthetic: ThemeAesthetic
  modePreference: ThemeModePreference
  palette: ThemePalette
}

export type ThemePresetId =
  | 'studio-signal'
  | 'soft-pearl'
  | 'neon-alloy'
  | 'night-signal'
  | 'crystal-pearl'
  | 'prism-signal'

export type ThemePresetOption = {
  id: string
  aesthetic: ThemeAesthetic
  palette: ThemePalette
  label: string
  themeName: string
}

export const PALETTE_OPTIONS: { description: string; id: ThemePalette; label: string }[] = [
  {
    id: 'signal',
    label: 'Signal',
    description: 'Citrus-fresh editorial energy with a bright, spring-like finish.',
  },
  {
    id: 'alloy',
    label: 'Alloy',
    description: 'Monochrome graphite precision with crisp, intelligent contrast.',
  },
  {
    id: 'pearl',
    label: 'Pearl',
    description: 'Clean cherry-blossom polish with fashion-forward warmth.',
  },
]

export const AESTHETIC_OPTIONS: {
  description: string
  id: ThemeAesthetic
  label: string
}[] = [
  {
    id: 'modern',
    label: 'Modern',
    description: 'Chic editorial structure with sharp, premium clarity.',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Bolder contrast and stronger directional energy.',
  },
  {
    id: 'glass',
    label: 'Glass',
    description: 'Layered translucency with a lighter, premium surface feel.',
  },
]

export const MODE_OPTIONS: {
  description: string
  id: ThemeModePreference
  label: string
}[] = [
  {
    id: 'system',
    label: 'System',
    description: 'Follow your device appearance automatically.',
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Keep the app bright and editorial all day.',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Use the dark theme regardless of device setting.',
  },
]

const THEME_PRESET_DEFINITIONS: Omit<ThemePresetOption, 'themeName'>[] = [
  {
    id: 'studio-signal',
    label: 'Citrus Signal',
    aesthetic: 'modern',
    palette: 'signal',
  },
  {
    id: 'soft-pearl',
    label: 'Sakura Pearl',
    aesthetic: 'modern',
    palette: 'pearl',
  },
  {
    id: 'neon-alloy',
    label: 'Neon Alloy',
    aesthetic: 'cyberpunk',
    palette: 'alloy',
  },
  {
    id: 'night-signal',
    label: 'Night Signal',
    aesthetic: 'cyberpunk',
    palette: 'signal',
  },
  {
    id: 'crystal-pearl',
    label: 'Crystal Pearl',
    aesthetic: 'glass',
    palette: 'pearl',
  },
  {
    id: 'prism-signal',
    label: 'Prism Signal',
    aesthetic: 'glass',
    palette: 'signal',
  },
]

const formatSimpleModeLabel = (resolvedMode: ThemeMode) =>
  resolvedMode === 'dark' ? 'Dark' : 'Light'

export const findThemePreset = (
  aesthetic: ThemeAesthetic,
  palette: ThemePalette
) =>
  THEME_PRESET_DEFINITIONS.find(
    (preset) => preset.aesthetic === aesthetic && preset.palette === palette
  ) ?? null

export const buildThemePresetOptions = (mode: ThemeMode): ThemePresetOption[] =>
  THEME_PRESET_DEFINITIONS.map((preset) => ({
    ...preset,
    themeName: getThemeName(preset.palette, preset.aesthetic, mode),
  }))

export const buildThemePickerLabel = (
  selection: Pick<ThemeDraft, 'aesthetic' | 'palette'>,
  resolvedMode: ThemeMode
) => {
  const preset = findThemePreset(selection.aesthetic, selection.palette)

  if (preset) {
    return `${preset.label} · ${formatSimpleModeLabel(resolvedMode)}`
  }

  const aestheticLabel =
    AESTHETIC_OPTIONS.find((option) => option.id === selection.aesthetic)?.label ??
    selection.aesthetic
  const paletteLabel =
    PALETTE_OPTIONS.find((option) => option.id === selection.palette)?.label ??
    selection.palette

  return `Custom · ${aestheticLabel} · ${paletteLabel} · ${formatSimpleModeLabel(
    resolvedMode
  )}`
}

export const formatModeLabel = (
  preference: ThemeModePreference,
  resolvedMode: ThemeMode
) => {
  if (preference === 'system') {
    return `System (${resolvedMode === 'dark' ? 'Dark' : 'Light'})`
  }

  return preference === 'dark' ? 'Dark' : 'Light'
}

export const formatModeSummary = (
  preference: ThemeModePreference,
  resolvedMode: ThemeMode
) => {
  if (preference === 'system') {
    return `system mode (${resolvedMode})`
  }

  return `${resolvedMode} mode`
}

export const buildThemeLabel = (
  selection: ThemeDraft,
  resolvedMode: ThemeMode
) => {
  const preset = findThemePreset(selection.aesthetic, selection.palette)
  const aestheticLabel =
    AESTHETIC_OPTIONS.find((option) => option.id === selection.aesthetic)?.label ??
    selection.aesthetic
  const paletteLabel =
    PALETTE_OPTIONS.find((option) => option.id === selection.palette)?.label ??
    selection.palette

  return `${preset?.label ?? `${aestheticLabel} · ${paletteLabel}`} · ${formatModeLabel(
    selection.modePreference,
    resolvedMode
  )}`
}

export const buildThemeSummary = (
  selection: ThemeDraft,
  resolvedMode: ThemeMode
) => {
  const aestheticSummary =
    AESTHETIC_OPTIONS.find((option) => option.id === selection.aesthetic)?.description ?? ''
  const paletteLabel =
    PALETTE_OPTIONS.find((option) => option.id === selection.palette)?.label ??
    selection.palette

  return `${aestheticSummary} ${paletteLabel} sets the color direction in ${formatModeSummary(
    selection.modePreference,
    resolvedMode
  )}.`
}

export const isThemeDraftEqual = (left: ThemeDraft, right: ThemeDraft) =>
  left.aesthetic === right.aesthetic &&
  left.palette === right.palette &&
  left.modePreference === right.modePreference
