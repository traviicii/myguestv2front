import { expect, test } from '@playwright/test'
import { config } from '../tamagui.config'

const palettes = ['signal', 'alloy', 'pearl'] as const
const aesthetics = ['modern', 'cyberpunk', 'glass'] as const
const modes = ['light', 'dark'] as const
const themes = config.themes as unknown as Record<string, Record<string, unknown>>

const normalizeHex = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed.startsWith('#')) {
    throw new Error(`Expected hex color. Received: ${value}`)
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
  throw new Error(`Unsupported color format: ${value}`)
}

const hexToRgb = (value: string) => {
  const hex = normalizeHex(value).slice(1)
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
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

const contrastRatio = (foreground: string, background: string) => {
  const left = relativeLuminance(foreground)
  const right = relativeLuminance(background)
  const lighter = Math.max(left, right)
  const darker = Math.min(left, right)
  return (lighter + 0.05) / (darker + 0.05)
}

const readThemeColor = (theme: Record<string, unknown>, key: string): string => {
  const raw = theme[key]
  if (typeof raw === 'string') return raw
  if (
    raw &&
    typeof raw === 'object' &&
    'val' in raw &&
    typeof (raw as { val?: unknown }).val === 'string'
  ) {
    return (raw as { val: string }).val
  }
  throw new Error(`Theme key ${key} is not a string color token.`)
}

const requiredGlassTokens = [
  'surfaceSecondary',
  'surfaceSecondaryBorder',
  'surfaceSecondaryPress',
  'surfaceTabGlass',
  'surfaceTabGlassBorder',
  'surfaceTabGlassShadow',
] as const

test('theme matrix contains all palette/aesthetic/mode variants', () => {
  for (const palette of palettes) {
    for (const aesthetic of aesthetics) {
      for (const mode of modes) {
        const themeName = `${palette}_${aesthetic}_${mode}`
        expect(themes[themeName]).toBeTruthy()
      }
    }
  }

  expect(themes.light).toStrictEqual(themes.signal_modern_light)
  expect(themes.dark).toStrictEqual(themes.signal_modern_dark)
})

test('primary and secondary button color pairs pass AA contrast in all generated themes', () => {
  for (const palette of palettes) {
    for (const aesthetic of aesthetics) {
      for (const mode of modes) {
        const themeName = `${palette}_${aesthetic}_${mode}`
        const theme = themes[themeName]

        const primaryRatio = contrastRatio(readThemeColor(theme, 'buttonPrimaryFg'), readThemeColor(theme, 'buttonPrimaryBg'))
        expect(primaryRatio).toBeGreaterThanOrEqual(4.5)

        const secondaryRatio = contrastRatio(
          readThemeColor(theme, 'buttonSecondaryFg'),
          readThemeColor(theme, 'buttonSecondaryBg')
        )
        expect(secondaryRatio).toBeGreaterThanOrEqual(4.5)
      }
    }
  }
})

test('glass themes expose new surface tokens and keep readable text contrast', () => {
  for (const palette of palettes) {
    for (const mode of modes) {
      const themeName = `${palette}_glass_${mode}`
      const theme = themes[themeName]

      requiredGlassTokens.forEach((token) => {
        expect(() => readThemeColor(theme, token)).not.toThrow()
      })

      const secondaryRatio = contrastRatio(
        readThemeColor(theme, 'textPrimary'),
        readThemeColor(theme, 'surfaceSecondary')
      )
      expect(secondaryRatio).toBeGreaterThanOrEqual(4.5)

      const tabGlassRatio = contrastRatio(
        readThemeColor(theme, 'textPrimary'),
        readThemeColor(theme, 'surfaceTabGlass')
      )
      expect(tabGlassRatio).toBeGreaterThanOrEqual(4.5)
    }
  }
})

test('glass signal light applies high-contrast spectral backdrop override', () => {
  const theme = themes.signal_glass_light
  expect(readThemeColor(theme, 'surfacePage')).toBe('#F7FFE6')
  expect(readThemeColor(theme, 'backdropStart')).toBe('#C4F25A')
  expect(readThemeColor(theme, 'backdropEnd')).toBe('#F5FFDE')
  expect(readThemeColor(theme, 'backdropAccent')).toBe('#7FD12B')
})
