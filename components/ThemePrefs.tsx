import type { ReactNode } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from './state/storage'

type ThemeMode = 'light' | 'dark'
type ThemePalette = 'studio' | 'slate' | 'sand'

type ThemePrefs = {
  mode: ThemeMode
  palette: ThemePalette
  themeName: string
  setMode: (mode: ThemeMode) => void
  setPalette: (palette: ThemePalette) => void
}

const getThemeName = (palette: ThemePalette, mode: ThemeMode) =>
  `${palette}_${mode}`

// Keeps theme selection in persistent local storage and exposes a resolved
// Tamagui theme name (palette + light/dark mode) for app-wide styling.
export const useThemePrefs = create<ThemePrefs>()(
  persist(
    (set) => ({
      mode: 'light',
      palette: 'studio',
      themeName: getThemeName('studio', 'light'),
      setMode: (mode) =>
        set((state) => ({
          mode,
          themeName: getThemeName(state.palette, mode),
        })),
      setPalette: (palette) =>
        set((state) => ({
          palette,
          themeName: getThemeName(palette, state.mode),
        })),
    }),
    {
      name: 'theme-prefs',
      storage: zustandStorage,
      partialize: (state) => ({ mode: state.mode, palette: state.palette }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<ThemePrefs>) }
        return {
          ...merged,
          themeName: getThemeName(merged.palette, merged.mode),
        }
      },
    }
  )
)

export function ThemePrefsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
