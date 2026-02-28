const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const RGB_COLOR_RE =
  /^rgba?\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)(?:\s*,\s*(-?\d*\.?\d+)\s*)?\)$/i
const HSL_COLOR_RE =
  /^hsla?\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)%\s*,\s*(-?\d*\.?\d+)%(?:\s*,\s*(-?\d*\.?\d+)\s*)?\)$/i
const NAMED_COLOR_RE = /^[a-z]+$/i

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(upper, Math.max(lower, value))

const normalizeHue = (value: number) => {
  const mod = value % 360
  return mod < 0 ? mod + 360 : mod
}

// Coerces unknown color values into native-safe CSS/RN color strings.
// Useful when theme tokens may resolve to non-native formats (for example CSS vars).
export function toNativeColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback

  const color = value.trim()
  if (!color) return fallback
  if (color.startsWith('$') || color.startsWith('var(')) return fallback

  if (color.toLowerCase() === 'transparent') return color
  if (HEX_COLOR_RE.test(color)) return color
  if (NAMED_COLOR_RE.test(color)) return color

  const rgbMatch = color.match(RGB_COLOR_RE)
  if (rgbMatch) {
    const r = Math.round(clamp(Number(rgbMatch[1]), 0, 255))
    const g = Math.round(clamp(Number(rgbMatch[2]), 0, 255))
    const b = Math.round(clamp(Number(rgbMatch[3]), 0, 255))
    const hasAlpha = rgbMatch[4] !== undefined
    if (!hasAlpha) return `rgb(${r}, ${g}, ${b})`
    const a = clamp(Number(rgbMatch[4]), 0, 1)
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  const hslMatch = color.match(HSL_COLOR_RE)
  if (hslMatch) {
    const h = normalizeHue(Number(hslMatch[1]))
    const s = clamp(Number(hslMatch[2]), 0, 100)
    const l = clamp(Number(hslMatch[3]), 0, 100)
    const hasAlpha = hslMatch[4] !== undefined
    if (!hasAlpha) return `hsl(${h}, ${s}%, ${l}%)`
    const a = clamp(Number(hslMatch[4]), 0, 1)
    return `hsla(${h}, ${s}%, ${l}%, ${a})`
  }

  return fallback
}
