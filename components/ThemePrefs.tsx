import type { ReactNode } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from './state/storage'

export type ThemeMode = 'light' | 'dark'
export type ThemePalette = 'signal' | 'alloy' | 'pearl'
export type ThemeAesthetic = 'modern' | 'cyberpunk' | 'glass'

type ThemePrefs = {
  mode: ThemeMode
  palette: ThemePalette
  aesthetic: ThemeAesthetic
  themeName: string
  setMode: (mode: ThemeMode) => void
  setPalette: (palette: ThemePalette) => void
  setAesthetic: (aesthetic: ThemeAesthetic) => void
}

const LEGACY_PALETTE_MAP = {
  studio: 'alloy',
  slate: 'signal',
  sand: 'pearl',
} as const

const getThemeName = (
  palette: ThemePalette,
  aesthetic: ThemeAesthetic,
  mode: ThemeMode
) => `${palette}_${aesthetic}_${mode}`

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark'

const isThemePalette = (value: unknown): value is ThemePalette =>
  value === 'signal' || value === 'alloy' || value === 'pearl'

const isLegacyThemePalette = (
  value: unknown
): value is keyof typeof LEGACY_PALETTE_MAP =>
  value === 'studio' || value === 'slate' || value === 'sand'

const isThemeAesthetic = (value: unknown): value is ThemeAesthetic =>
  value === 'modern' || value === 'cyberpunk' || value === 'glass'

const resolvePalette = (value: unknown, fallback: ThemePalette): ThemePalette => {
  if (isThemePalette(value)) return value
  if (isLegacyThemePalette(value)) return LEGACY_PALETTE_MAP[value]
  return fallback
}

// Keeps theme selection in persistent local storage and exposes a resolved
// Tamagui theme name (palette + light/dark mode) for app-wide styling.
export const useThemePrefs = create<ThemePrefs>()(
  persist(
    (set) => ({
      mode: 'light',
      palette: 'signal',
      aesthetic: 'modern',
      themeName: getThemeName('signal', 'modern', 'light'),
      setMode: (mode) =>
        set((state) => ({
          mode,
          themeName: getThemeName(state.palette, state.aesthetic, mode),
        })),
      setPalette: (palette) =>
        set((state) => ({
          palette,
          themeName: getThemeName(palette, state.aesthetic, state.mode),
        })),
      setAesthetic: (aesthetic) =>
        set((state) => ({
          aesthetic,
          themeName: getThemeName(state.palette, aesthetic, state.mode),
        })),
    }),
    {
      name: 'theme-prefs',
      storage: zustandStorage,
      partialize: (state) => ({
        mode: state.mode,
        palette: state.palette,
        aesthetic: state.aesthetic,
      }),
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<ThemePrefs>
        const mode = isThemeMode(persistedState.mode)
          ? persistedState.mode
          : current.mode
        const palette = resolvePalette(persistedState.palette, current.palette)
        const aesthetic = isThemeAesthetic(persistedState.aesthetic)
          ? persistedState.aesthetic
          : current.aesthetic

        const merged = {
          ...current,
          ...persistedState,
          mode,
          palette,
          aesthetic,
        }

        return {
          ...merged,
          themeName: getThemeName(palette, aesthetic, mode),
        }
      },
    }
  )
)

export function ThemePrefsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
