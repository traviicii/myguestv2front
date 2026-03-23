import { useEffect, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  getThemeName,
  type ThemeMode,
  useThemePrefs,
} from 'components/ThemePrefs'

import {
  buildThemePickerLabel,
  buildThemePresetOptions,
  findThemePreset,
  type ThemeDraft,
} from './themeOptions'

export function useThemePickerScreenModel() {
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const bottomInset = Math.max(insets.bottom + 20, 24)
  const {
    aesthetic,
    mode,
    modePreference,
    palette,
    setAesthetic,
    setModePreference,
    setPalette,
  } = useThemePrefs()
  const [draftTheme, setDraftTheme] = useState<Omit<ThemeDraft, 'modePreference'> & {
    mode: ThemeMode
  }>({
    aesthetic,
    mode,
    palette,
  })
  const [modeTouched, setModeTouched] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  useEffect(() => {
    setDraftTheme({
      aesthetic,
      mode,
      palette,
    })
    setModeTouched(false)
    setCustomizeOpen(false)
  }, [aesthetic, mode, palette])

  const previewThemeSelection = useMemo(
    () => ({
      aesthetic: draftTheme.aesthetic,
      mode: draftTheme.mode,
      palette: draftTheme.palette,
    }),
    [draftTheme.aesthetic, draftTheme.mode, draftTheme.palette]
  )
  const previewThemeName = getThemeName(
    draftTheme.palette,
    draftTheme.aesthetic,
    draftTheme.mode
  )
  const controlsThemeSelection = useMemo(
    () => ({
      aesthetic: 'modern' as const,
      mode: draftTheme.mode,
      palette: 'signal' as const,
    }),
    [draftTheme.mode]
  )
  const controlsThemeName = getThemeName('signal', 'modern', draftTheme.mode)
  const hasPendingThemeChanges =
    draftTheme.aesthetic !== aesthetic ||
    draftTheme.palette !== palette ||
    (modeTouched && (modePreference === 'system' || draftTheme.mode !== mode))
  const savedThemeLabel = buildThemePickerLabel(
    {
      aesthetic,
      palette,
    },
    mode
  )
  const draftThemeLabel = buildThemePickerLabel(
    {
      aesthetic: draftTheme.aesthetic,
      palette: draftTheme.palette,
    },
    draftTheme.mode
  )
  const presetOptions = useMemo(
    () => buildThemePresetOptions(draftTheme.mode),
    [draftTheme.mode]
  )
  const selectedPresetId =
    findThemePreset(draftTheme.aesthetic, draftTheme.palette)?.id ?? null
  const isCustomDraft = selectedPresetId === null

  const handleApplyTheme = () => {
    if (!hasPendingThemeChanges) return

    setAesthetic(draftTheme.aesthetic)
    setPalette(draftTheme.palette)
    if (modeTouched) {
      setModePreference(draftTheme.mode)
    }
    setCustomizeOpen(false)
  }

  const handleResetThemeDraft = () => {
    setDraftTheme({
      aesthetic,
      mode,
      palette,
    })
    setModeTouched(false)
    setCustomizeOpen(false)
  }

  const handleSelectAesthetic = (nextAesthetic: ThemeDraft['aesthetic']) => {
    setDraftTheme((prev) => ({
      ...prev,
      aesthetic: nextAesthetic,
    }))
  }

  const handleSelectPalette = (nextPalette: ThemeDraft['palette']) => {
    setDraftTheme((prev) => ({
      ...prev,
      palette: nextPalette,
    }))
  }

  const handleSelectPreset = (presetId: string) => {
    const preset = presetOptions.find((option) => option.id === presetId)
    if (!preset) return

    setDraftTheme((prev) => ({
      ...prev,
      aesthetic: preset.aesthetic,
      palette: preset.palette,
    }))
  }

  const handleToggleMode = (nextMode: ThemeMode) => {
    setDraftTheme((prev) => ({
      ...prev,
      mode: nextMode,
    }))
    setModeTouched(modePreference === 'system' ? true : nextMode !== mode)
  }

  const handleOpenCustomize = () => {
    setCustomizeOpen(true)
  }

  const handleCloseCustomize = () => {
    setCustomizeOpen(false)
  }

  return {
    bottomInset,
    controlsThemeName,
    controlsThemeSelection,
    customizeOpen,
    draftTheme,
    draftThemeLabel,
    handleApplyTheme,
    handleCloseCustomize,
    handleOpenCustomize,
    handleResetThemeDraft,
    handleSelectAesthetic,
    handleSelectPalette,
    handleSelectPreset,
    handleToggleMode,
    hasPendingThemeChanges,
    isCustomDraft,
    presetOptions,
    previewThemeName,
    previewThemeSelection,
    savedThemeLabel,
    selectedPresetId,
    topInset,
  }
}

export type ThemePickerScreenModel = ReturnType<typeof useThemePickerScreenModel>
