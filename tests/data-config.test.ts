import { expect, test } from '@playwright/test'

import {
  MISSING_API_BASE_URL_ERROR,
  normalizeApiBaseUrl,
  resolveApiBaseUrl,
} from '../components/data/config'

test('real api mode requires an explicit api base url', () => {
  expect(() => resolveApiBaseUrl({ apiBaseUrl: undefined, useMockData: false })).toThrow(
    MISSING_API_BASE_URL_ERROR
  )
  expect(() => resolveApiBaseUrl({ apiBaseUrl: '   ', useMockData: false })).toThrow(
    MISSING_API_BASE_URL_ERROR
  )
})

test('mock mode can run without an api base url', () => {
  expect(resolveApiBaseUrl({ apiBaseUrl: undefined, useMockData: true })).toBe('')
})

test('api base url normalization trims whitespace and trailing slashes', () => {
  expect(normalizeApiBaseUrl(' https://example.com/api/v1/// ')).toBe(
    'https://example.com/api/v1'
  )
  expect(
    resolveApiBaseUrl({
      apiBaseUrl: ' https://example.com/api/v1/// ',
      useMockData: false,
    })
  ).toBe('https://example.com/api/v1')
})
