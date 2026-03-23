import type { ThemeAesthetic, ThemeMode, ThemePalette } from './ThemePrefs'
import type { AmbientEffectMode } from './ambientBackdropTypes'

export type AmbientBackdropResolvedMode = Exclude<AmbientEffectMode, 'auto'>

export type AmbientBackdropVisuals = {
  accentOpacity: number
  secondaryOpacity: number
  veilOpacity: number
  glassLight: boolean
  glassLiquidBase: [string, string, string] | null
  blobOpacity: number
  blobAccentAlpha: number
  blobStartAlpha: number
  blobEndAlpha: number
  topShapeColors: [string, string]
  lowerShapeColors: [string, string]
  sheenColor: string
  blurIntensity: number
  isGlassNative: boolean
  showAmbientShapes: boolean
}

type AmbientBackdropVisualInput = {
  aesthetic: ThemeAesthetic
  mode: ThemeMode
  palette: ThemePalette
  backdropStart: string
  backdropEnd: string
  backdropAccent: string
}

export const clampAmbientValue = (value: number, lower: number, upper: number) =>
  Math.min(upper, Math.max(lower, value))

export function toAlpha(value: string, alpha: number) {
  const color = value.trim()
  if (color.startsWith('#')) {
    const raw = color.slice(1)
    const normalized =
      raw.length === 3
        ? raw
            .split('')
            .map((char) => `${char}${char}`)
            .join('')
        : raw
    if (normalized.length !== 6) return color
    const r = Number.parseInt(normalized.slice(0, 2), 16)
    const g = Number.parseInt(normalized.slice(2, 4), 16)
    const b = Number.parseInt(normalized.slice(4, 6), 16)
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return color
    return `rgba(${r}, ${g}, ${b}, ${clampAmbientValue(alpha, 0, 1)})`
  }

  const rgbMatch = color.match(
    /^rgba?\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)(?:\s*,\s*(-?\d*\.?\d+)\s*)?\)$/i
  )
  if (!rgbMatch) return color

  const r = Math.round(clampAmbientValue(Number(rgbMatch[1]), 0, 255))
  const g = Math.round(clampAmbientValue(Number(rgbMatch[2]), 0, 255))
  const b = Math.round(clampAmbientValue(Number(rgbMatch[3]), 0, 255))
  return `rgba(${r}, ${g}, ${b}, ${clampAmbientValue(alpha, 0, 1)})`
}

export function resolveAmbientEffectMode(
  effectMode: AmbientEffectMode
): AmbientBackdropResolvedMode {
  return effectMode === 'auto' ? 'faux' : effectMode
}

export function shouldAnimateAmbientBackdrop(
  resolvedMode: AmbientBackdropResolvedMode,
  aesthetic: ThemeAesthetic
) {
  return resolvedMode !== 'off' && aesthetic === 'glass'
}

export function buildAmbientBackdropVisuals({
  aesthetic,
  mode,
  palette,
  backdropStart,
  backdropEnd,
  backdropAccent,
}: AmbientBackdropVisualInput): AmbientBackdropVisuals {
  const isModern = aesthetic === 'modern'
  const glassLight = aesthetic === 'glass' && mode === 'light'
  const isSignalGlassLight = glassLight && palette === 'signal'
  const accentOpacity =
    aesthetic === 'cyberpunk'
      ? 0.26
      : glassLight
        ? isSignalGlassLight
          ? 0.2
          : 0.27
        : aesthetic === 'glass'
          ? 0.24
          : isModern
            ? mode === 'dark'
              ? 0.16
              : 0.12
            : 0.1
  const secondaryOpacity =
    aesthetic === 'cyberpunk'
      ? 0.16
      : glassLight
        ? isSignalGlassLight
          ? 0.13
          : 0.18
        : aesthetic === 'glass'
          ? 0.16
          : isModern
            ? mode === 'dark'
              ? 0.11
              : 0.09
            : 0.08
  const veilOpacity = glassLight
    ? 0.12
    : aesthetic === 'glass'
      ? 0.2
      : isModern
        ? mode === 'dark'
          ? 0.04
          : 0.03
        : 0.08

  return {
    accentOpacity,
    secondaryOpacity,
    veilOpacity,
    glassLight,
    glassLiquidBase: glassLight
      ? [
          toAlpha(backdropStart, 0.9),
          toAlpha(backdropAccent, isSignalGlassLight ? 0.22 : 0.32),
          toAlpha(backdropEnd, 0.95),
        ]
      : null,
    blobOpacity: glassLight ? (palette === 'alloy' ? 0.34 : isSignalGlassLight ? 0.16 : 0.26) : 0,
    blobAccentAlpha: palette === 'alloy' ? 0.55 : isSignalGlassLight ? 0.3 : 0.42,
    blobStartAlpha: palette === 'alloy' ? 0.38 : isSignalGlassLight ? 0.2 : 0.28,
    blobEndAlpha: palette === 'alloy' ? 0.3 : isSignalGlassLight ? 0.16 : 0.22,
    topShapeColors: isModern
      ? mode === 'dark'
        ? [toAlpha(backdropAccent, 0.28), toAlpha(backdropStart, 0.04)]
        : [toAlpha(backdropAccent, 0.24), toAlpha(backdropStart, 0.06)]
      : mode === 'dark'
        ? [toAlpha(backdropAccent, 0.52), toAlpha(backdropStart, 0.1)]
        : [toAlpha(backdropAccent, 0.68), toAlpha(backdropStart, 0.16)],
    lowerShapeColors: isModern
      ? mode === 'dark'
        ? [toAlpha(backdropStart, 0.18), toAlpha(backdropEnd, 0.02)]
        : [toAlpha(backdropStart, 0.18), toAlpha(backdropEnd, 0.04)]
      : mode === 'dark'
        ? [toAlpha(backdropStart, 0.4), toAlpha(backdropEnd, 0.08)]
        : [toAlpha(backdropStart, 0.48), toAlpha(backdropEnd, 0.12)],
    sheenColor: toAlpha(backdropAccent, mode === 'dark' ? 0.4 : 0.2),
    blurIntensity: isModern ? 0 : mode === 'dark' ? 24 : 28,
    isGlassNative: aesthetic === 'glass',
    showAmbientShapes: !(aesthetic === 'glass' && mode === 'dark'),
  }
}
