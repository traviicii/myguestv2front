import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from './state/storage'

export type ThemeMode = 'light' | 'dark'
export type ThemeModePreference = 'system' | ThemeMode
export type ThemePalette = 'signal' | 'alloy' | 'pearl'
export type ThemeAesthetic = 'modern' | 'cyberpunk' | 'glass'
export type ThemeSelectionOverride = {
  palette: ThemePalette
  aesthetic: ThemeAesthetic
  mode: ThemeMode
}

type ThemePrefs = {
  mode: ThemeMode
  modePreference: ThemeModePreference
  palette: ThemePalette
  aesthetic: ThemeAesthetic
  systemMode: ThemeMode
  themeName: string
  setMode: (mode: ThemeModePreference) => void
  setModePreference: (mode: ThemeModePreference) => void
  setPalette: (palette: ThemePalette) => void
  setAesthetic: (aesthetic: ThemeAesthetic) => void
  setSystemMode: (mode: ThemeMode) => void
}

const LEGACY_PALETTE_MAP = {
  studio: 'alloy',
  slate: 'signal',
  sand: 'pearl',
} as const

const ThemeSelectionOverrideContext = createContext<ThemeSelectionOverride | null>(null)

export const getThemeName = (
  palette: ThemePalette,
  aesthetic: ThemeAesthetic,
  mode: ThemeMode
) => `${palette}_${aesthetic}_${mode}`

const resolveMode = (
  modePreference: ThemeModePreference,
  systemMode: ThemeMode
): ThemeMode => (modePreference === 'system' ? systemMode : modePreference)

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark'

const isThemeModePreference = (value: unknown): value is ThemeModePreference =>
  value === 'system' || isThemeMode(value)

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
      modePreference: 'system',
      palette: 'signal',
      aesthetic: 'modern',
      systemMode: 'light',
      themeName: getThemeName('signal', 'modern', 'light'),
      setModePreference: (modePreference) =>
        set((state) => ({
          modePreference,
          mode: resolveMode(modePreference, state.systemMode),
          themeName: getThemeName(
            state.palette,
            state.aesthetic,
            resolveMode(modePreference, state.systemMode)
          ),
        })),
      setMode: (modePreference) =>
        set((state) => ({
          modePreference,
          mode: resolveMode(modePreference, state.systemMode),
          themeName: getThemeName(
            state.palette,
            state.aesthetic,
            resolveMode(modePreference, state.systemMode)
          ),
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
      setSystemMode: (systemMode) =>
        set((state) => {
          const nextMode = resolveMode(state.modePreference, systemMode)
          return {
            systemMode,
            mode: nextMode,
            themeName: getThemeName(state.palette, state.aesthetic, nextMode),
          }
        }),
    }),
    {
      name: 'theme-prefs',
      storage: zustandStorage,
      partialize: (state) => ({
        modePreference: state.modePreference,
        palette: state.palette,
        aesthetic: state.aesthetic,
      }),
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<ThemePrefs>
        const modePreference = isThemeModePreference(persistedState.modePreference)
          ? persistedState.modePreference
          : isThemeMode(persistedState.mode)
            ? persistedState.mode
            : current.modePreference
        const palette = resolvePalette(persistedState.palette, current.palette)
        const aesthetic = isThemeAesthetic(persistedState.aesthetic)
          ? persistedState.aesthetic
          : current.aesthetic
        const systemMode = isThemeMode(persistedState.systemMode)
          ? persistedState.systemMode
          : current.systemMode
        const mode = resolveMode(modePreference, systemMode)

        const merged = {
          ...current,
          ...persistedState,
          modePreference,
          mode,
          palette,
          aesthetic,
          systemMode,
        }

        return {
          ...merged,
          themeName: getThemeName(palette, aesthetic, mode),
        }
      },
    }
  )
)

export function ThemeSelectionOverrideProvider({
  children,
  value,
}: {
  children: ReactNode
  value: ThemeSelectionOverride
}) {
  return (
    <ThemeSelectionOverrideContext.Provider value={value}>
      {children}
    </ThemeSelectionOverrideContext.Provider>
  )
}

export function useResolvedThemeSelection(): ThemeSelectionOverride {
  const override = useContext(ThemeSelectionOverrideContext)
  const palette = useThemePrefs((state) => state.palette)
  const aesthetic = useThemePrefs((state) => state.aesthetic)
  const mode = useThemePrefs((state) => state.mode)

  return override ?? { palette, aesthetic, mode }
}

export function ThemePrefsProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme()
  const setSystemMode = useThemePrefs((state) => state.setSystemMode)

  useEffect(() => {
    setSystemMode(colorScheme === 'dark' ? 'dark' : 'light')
  }, [colorScheme, setSystemMode])

  return <>{children}</>
}
