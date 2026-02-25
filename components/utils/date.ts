const pad = (value: number) => String(value).padStart(2, '0')

type Ymd = { y: number; m: number; d: number }

// Accepts the date formats currently present across mock data and forms.
// We normalize once so all UI formatters share the same parsing behavior.
const parseYmd = (dateString: string): Ymd | null => {
  const trimmed = (dateString || '').trim()
  if (!trimmed || trimmed === '—') return null

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return {
      y: Number(isoMatch[1]),
      m: Number(isoMatch[2]),
      d: Number(isoMatch[3]),
    }
  }

  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (slashMatch) {
    return {
      y: Number(slashMatch[3]),
      m: Number(slashMatch[1]),
      d: Number(slashMatch[2]),
    }
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return {
      y: parsed.getFullYear(),
      m: parsed.getMonth() + 1,
      d: parsed.getDate(),
    }
  }

  return null
}

export const formatDateMMDDYYYY = (dateString: string) => {
  const ymd = parseYmd(dateString)
  if (!ymd) return (dateString || '—').trim()
  return `${pad(ymd.m)}/${pad(ymd.d)}/${ymd.y}`
}

export const formatDateLabel = (
  dateString: string,
  { todayLabel = false } = {}
) => {
  const ymd = parseYmd(dateString)
  if (!ymd) return (dateString || '—').trim()
  if (todayLabel) {
    const today = new Date()
    if (
      ymd.y === today.getFullYear() &&
      ymd.m === today.getMonth() + 1 &&
      ymd.d === today.getDate()
    ) {
      return 'Today'
    }
  }
  return `${pad(ymd.m)}/${pad(ymd.d)}/${ymd.y}`
}

const getOrdinalSuffix = (day: number) => {
  if (day % 100 >= 11 && day % 100 <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export const formatDateLong = (dateString: string) => {
  const ymd = parseYmd(dateString)
  if (!ymd) return (dateString || '—').trim()
  const date = new Date(ymd.y, ymd.m - 1, ymd.d)
  if (Number.isNaN(date.getTime())) return (dateString || '—').trim()

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const suffix = getOrdinalSuffix(ymd.d)
  return `${weekday}, ${month} ${ymd.d}${suffix} ${ymd.y}`
}
