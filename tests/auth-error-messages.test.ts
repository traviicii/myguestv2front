import { expect, test } from '@playwright/test'

import { formatAuthErrorMessage } from 'components/auth/authErrorMessages'

test('apple audience mismatch copy makes the setup issue explicit', async () => {
  expect(
    formatAuthErrorMessage(
      new Error(
        'Firebase: The audience in ID Token [com.travispeck.myguest] does not match the expected audience. (auth/invalid-credential).'
      )
    )
  ).toContain("isn't fully wired for this build yet")
})

test('account-exists-with-different-credential copy points to linking gap', async () => {
  expect(
    formatAuthErrorMessage({
      code: 'auth/account-exists-with-different-credential',
      message: 'Account exists with different credential.',
    })
  ).toContain('Account linking is still being finished')
})

test('network errors keep a practical retry message', async () => {
  expect(
    formatAuthErrorMessage({
      code: 'auth/network-request-failed',
      message: 'Network request failed',
    })
  ).toContain('Check your connection and try again')
})

test('fallback error message stays stable', async () => {
  expect(formatAuthErrorMessage(null)).toBe('Unable to sign in right now.')
})
