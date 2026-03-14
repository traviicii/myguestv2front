import { expect, test } from '@playwright/test'

import {
  formatDateFromPicker,
  parseDateForPicker,
} from '../components/appointments/shared/datePicker'

test('date picker helpers round-trip supported appointment dates', () => {
  const parsed = parseDateForPicker('03/07/2026')

  expect(parsed).not.toBeNull()
  expect(formatDateFromPicker(parsed as Date)).toBe('03/07/2026')
})

test('date picker helpers reject invalid display strings', () => {
  expect(parseDateForPicker('2026-03-07')).toBeNull()
  expect(parseDateForPicker('')).toBeNull()
  expect(parseDateForPicker('No visits yet')).toBeNull()
})
