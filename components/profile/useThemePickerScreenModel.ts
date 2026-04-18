import { useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { getThemeName, type ThemeMode, useThemePrefs } from 'components/ThemePrefs'

import {
  buildThemePickerLabel,
  buildThemePresetOptions,
  findThemePreset,
  type ThemeDraft,
} from './themeOptions'

export function useThemePickerScreenModel() {
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const bottomInset = Math.max(insets.bottom + 24, 28)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const aesthetic = useThemePrefs((state) => state.aesthetic)
  const mode = useThemePrefs((state) => state.mode)
  const modePreference = useThemePrefs((state) => state.modePreference)
  const palette = useThemePrefs((state) => state.palette)
  const systemMode = useThemePrefs((state) => state.systemMode)

  const currentThemeName = getThemeName(palette, aesthetic, mode)
  const currentThemeSelection = useMemo(
    () => ({
      aesthetic,
      mode,
      palette,
    }),
    [aesthetic, mode, palette]
  )
  const currentThemeLabel = buildThemePickerLabel(
    {
      aesthetic,
      palette,
    },
    mode
  )

  const presetOptions = useMemo(() => buildThemePresetOptions(), [])
  const currentPresetId = findThemePreset(aesthetic, palette, mode)?.id ?? null

  const setLiveTheme = ({
    nextAesthetic,
    nextMode,
    nextModePreference,
    nextPalette,
  }: {
    nextAesthetic?: ThemeDraft['aesthetic']
    nextMode?: ThemeMode
    nextModePreference?: 'system' | ThemeMode
    nextPalette?: ThemeDraft['palette']
  }) => {
    useThemePrefs.setState((state) => {
      const resolvedModePreference = nextModePreference ?? state.modePreference
      const resolvedMode =
        nextMode ?? (resolvedModePreference === 'system' ? state.systemMode : resolvedModePreference)
      const resolvedPalette = nextPalette ?? state.palette
      const resolvedAesthetic = nextAesthetic ?? state.aesthetic

      return {
        aesthetic: resolvedAesthetic,
        mode: resolvedMode,
        modePreference: resolvedModePreference,
        palette: resolvedPalette,
        themeName: getThemeName(resolvedPalette, resolvedAesthetic, resolvedMode),
      }
    })
  }

  const handleSelectPreset = (presetId: string) => {
    const preset = presetOptions.find((option) => option.id === presetId)
    if (!preset) return

    setLiveTheme({
      nextAesthetic: preset.aesthetic,
      nextMode: preset.mode,
      nextModePreference: preset.mode,
      nextPalette: preset.palette,
    })
  }

  const handleToggleMode = (nextMode: ThemeMode) => {
    setLiveTheme({
      nextMode,
      nextModePreference: nextMode,
    })
  }

  const handleSelectAesthetic = (nextAesthetic: ThemeDraft['aesthetic']) => {
    setLiveTheme({
      nextAesthetic,
      nextModePreference: modePreference,
      nextMode: modePreference === 'system' ? systemMode : undefined,
    })
  }

  const handleSelectPalette = (nextPalette: ThemeDraft['palette']) => {
    setLiveTheme({
      nextPalette,
      nextModePreference: modePreference,
      nextMode: modePreference === 'system' ? systemMode : undefined,
    })
  }

  const handleOpenCustomize = () => {
    setCustomizeOpen(true)
  }

  const handleCloseCustomize = () => {
    setCustomizeOpen(false)
  }

  return {
    aesthetic,
    bottomInset,
    currentPresetId,
    currentThemeLabel,
    currentThemeName,
    currentThemeSelection,
    customizeOpen,
    handleCloseCustomize,
    handleOpenCustomize,
    handleSelectAesthetic,
    handleSelectPalette,
    handleSelectPreset,
    handleToggleMode,
    mode,
    palette,
    presetOptions,
    topInset,
  }
}

export type ThemePickerScreenModel = ReturnType<typeof useThemePickerScreenModel>
