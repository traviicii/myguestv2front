export const clamp = (value: number, lower: number, upper: number) =>
  Math.min(upper, Math.max(lower, value))

const normalizeHex = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed.startsWith('#')) {
    throw new Error(`Expected hex color, received "${value}"`)
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
  throw new Error(`Unsupported hex color: "${value}"`)
}

const hexToRgb = (value: string) => {
  const hex = normalizeHex(value).slice(1)
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map((channel) => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`

export const mixHex = (left: string, right: string, weight: number) => {
  const ratio = clamp(weight, 0, 1)
  const a = hexToRgb(left)
  const b = hexToRgb(right)
  return rgbToHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  })
}

export const withAlpha = (value: string, alpha: number) => {
  const rgb = hexToRgb(value)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`
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

export const contrastRatio = (left: string, right: string) => {
  const luminanceLeft = relativeLuminance(left)
  const luminanceRight = relativeLuminance(right)
  const lighter = Math.max(luminanceLeft, luminanceRight)
  const darker = Math.min(luminanceLeft, luminanceRight)
  return (lighter + 0.05) / (darker + 0.05)
}

export const assertContrast = (
  label: string,
  foreground: string,
  background: string,
  minimum = 4.5
) => {
  const ratio = contrastRatio(foreground, background)
  if (ratio < minimum) {
    throw new Error(
      `[theme:${label}] Contrast ratio ${ratio.toFixed(2)} is below ${minimum.toFixed(1)}`
    )
  }
}

export const makeReadableTone = (
  primary: string,
  background: string,
  minimumRatio: number,
  initialMix: number
) => {
  let candidate = mixHex(primary, background, initialMix)
  for (let index = 0; index < 14; index += 1) {
    if (contrastRatio(candidate, background) >= minimumRatio) {
      return candidate
    }
    candidate = mixHex(candidate, primary, 0.16)
  }
  return primary
}

export const normalizeAccentPair = (accent: string) => {
  const darkText = '#0A1018'
  const lightText = '#FFFFFF'
  let background = normalizeHex(accent)
  let foreground =
    contrastRatio(lightText, background) >= contrastRatio(darkText, background)
      ? lightText
      : darkText

  for (let index = 0; index < 14; index += 1) {
    if (contrastRatio(foreground, background) >= 4.5) {
      break
    }

    background =
      foreground === lightText
        ? mixHex(background, '#000000', 0.08)
        : mixHex(background, '#FFFFFF', 0.08)
  }

  return { background, foreground }
}

export const pickReadableForeground = (background: string, preferred: string) => {
  if (contrastRatio(preferred, background) >= 4.5) {
    return preferred
  }
  const darkText = '#0A1018'
  const lightText = '#FFFFFF'
  return contrastRatio(lightText, background) >= contrastRatio(darkText, background)
    ? lightText
    : darkText
}
