import { expect, test } from '@playwright/test'

import {
  formatPriceFromCents,
  getSelectedServiceSummary,
  getSuggestedPriceCents,
  moveImageToFront,
  parseAppointmentPrice,
  prependImages,
  removeImageAtIndex,
} from '../components/appointments/shared/appointmentFormUtils'

test('appointment form helpers parse and format prices safely', () => {
  expect(parseAppointmentPrice('95')).toBe(95)
  expect(parseAppointmentPrice('$95.50')).toBe(95.5)
  expect(parseAppointmentPrice('')).toBeNull()
  expect(formatPriceFromCents(9550)).toBe('95.50')
  expect(formatPriceFromCents(9500)).toBe('95')
  expect(formatPriceFromCents(null)).toBe('')
})

test('appointment form helpers summarize services and suggested price', () => {
  expect(getSelectedServiceSummary([])).toBe('Select services')
  expect(getSelectedServiceSummary([{ name: 'Gloss' }])).toBe('Gloss')
  expect(getSelectedServiceSummary([{ name: 'Gloss' }, { name: 'Cut' }])).toBe(
    'Gloss +1'
  )
  expect(
    getSuggestedPriceCents([
      { defaultPriceCents: 9000 },
      { defaultPriceCents: null },
      { defaultPriceCents: 4500 },
    ])
  ).toBe(13500)
})

test('appointment form helpers update image ordering deterministically', () => {
  expect(prependImages(['b', 'c'], ['a'])).toEqual(['a', 'b', 'c'])
  expect(removeImageAtIndex(['a', 'b', 'c'], 1)).toEqual(['a', 'c'])
  expect(moveImageToFront(['a', 'b', 'c'], 2)).toEqual(['c', 'a', 'b'])
  expect(moveImageToFront(['a', 'b', 'c'], 0)).toEqual(['a', 'b', 'c'])
})
