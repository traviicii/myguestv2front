export type GlassThemeMode = 'light' | 'dark'
export type GlassDensity = 'panel' | 'orb' | 'tab'
export type GlassTint = {
  accent: string
  start: string
}

type GlassLayerColors = {
  panel: [string, string, string]
  orb: [string, string, string]
  tab: [string, string, string]
}

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(upper, Math.max(lower, value))

const hexToRgba = (hexColor: string, alpha: number) => {
  const hex = hexColor.replace('#', '').trim()
  if (hex.length !== 3 && hex.length !== 6) return hexColor

  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : hex
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  if ([r, g, b].some((value) => Number.isNaN(value))) return hexColor
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`
}

const withAlpha = (color: string, alpha: number) => {
  const value = color.trim()
  if (value.startsWith('#')) return hexToRgba(value, alpha)

  const rgbMatch = value.match(
    /^rgba?\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)(?:\s*,\s*(-?\d*\.?\d+)\s*)?\)$/i
  )
  if (!rgbMatch) return value
  const r = Math.round(clamp(Number(rgbMatch[1]), 0, 255))
  const g = Math.round(clamp(Number(rgbMatch[2]), 0, 255))
  const b = Math.round(clamp(Number(rgbMatch[3]), 0, 255))
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`
}

export const getGlassLayerColors = (
  mode: GlassThemeMode,
  tint?: Partial<GlassTint>
): GlassLayerColors => {
  const accent = tint?.accent ?? (mode === 'dark' ? '#9AB8FF' : '#8FC3FF')
  const start = tint?.start ?? (mode === 'dark' ? '#465A84' : '#CFE2FF')

  if (mode === 'dark') {
    return {
      panel: [withAlpha('#FFFFFF', 0.12), withAlpha(accent, 0.16), withAlpha('#000000', 0.1)],
      orb: [withAlpha('#FFFFFF', 0.15), withAlpha(accent, 0.2), withAlpha('#000000', 0.14)],
      tab: [withAlpha('#FFFFFF', 0.14), withAlpha(accent, 0.18), withAlpha('#000000', 0.15)],
    }
  }

  return {
    panel: [withAlpha('#FFFFFF', 0.88), withAlpha(accent, 0.18), withAlpha(start, 0.16)],
    orb: [withAlpha('#FFFFFF', 0.9), withAlpha(accent, 0.22), withAlpha(start, 0.18)],
    tab: [withAlpha('#FFFFFF', 0.89), withAlpha(accent, 0.2), withAlpha(start, 0.17)],
  }
}

export const getGlassBlurIntensity = (
  mode: GlassThemeMode,
  density: GlassDensity
): number => {
  const darkMap: Record<GlassDensity, number> = {
    panel: 36,
    orb: 42,
    tab: 46,
  }
  const lightMap: Record<GlassDensity, number> = {
    panel: 54,
    orb: 58,
    tab: 60,
  }

  return mode === 'dark' ? darkMap[density] : lightMap[density]
}
