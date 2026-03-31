import { expect, test } from '@playwright/test'

import {
  formatPhoneForDisplay,
  formatPhoneForInput,
  normalizePhoneForStorage,
} from 'components/utils/phone'

test('phone utils format US-style input progressively', async () => {
  expect(formatPhoneForInput('5')).toBe('5')
  expect(formatPhoneForInput('555')).toBe('555')
  expect(formatPhoneForInput('5551')).toBe('(555) 1')
  expect(formatPhoneForInput('5551234')).toBe('(555) 123-4')
  expect(formatPhoneForInput('5551234567')).toBe('(555) 123-4567')
  expect(formatPhoneForInput('(555)123-4567')).toBe('(555) 123-4567')
})

test('phone utils normalize saved values without formatting punctuation', async () => {
  expect(normalizePhoneForStorage('(555) 123-4567')).toBe('5551234567')
  expect(normalizePhoneForStorage('1 (555) 123-4567')).toBe('5551234567')
  expect(normalizePhoneForStorage('+44 20 7123 1234')).toBe('+442071231234')
})

test('phone utils format stored values for display', async () => {
  expect(formatPhoneForDisplay('5551234567')).toBe('(555) 123-4567')
  expect(formatPhoneForDisplay('+442071231234')).toBe('+442071231234')
})
