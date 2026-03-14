import { formatDateMMDDYYYY } from 'components/utils/date'

const pad = (value: number) => String(value).padStart(2, '0')

export const formatDateFromPicker = (date: Date) =>
  formatDateMMDDYYYY(
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  )

export const parseDateForPicker = (value: string) => {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3])
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}
