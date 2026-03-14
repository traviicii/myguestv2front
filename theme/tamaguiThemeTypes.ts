export type ThemeMode = 'light' | 'dark'
export type ThemePalette = 'signal' | 'alloy' | 'pearl'
export type ThemeAesthetic = 'modern' | 'cyberpunk' | 'glass'

export type PaletteSeed = {
  background: string
  foreground: string
  border: string
  accent: string
}

export const modes: readonly ThemeMode[] = ['light', 'dark']
export const aesthetics: readonly ThemeAesthetic[] = ['modern', 'cyberpunk', 'glass']

export const paletteSeeds: Record<ThemePalette, Record<ThemeMode, PaletteSeed>> = {
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
