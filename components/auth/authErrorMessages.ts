type AuthErrorLike = {
  code?: string
  message?: string
}

const APPLE_AUDIENCE_MISMATCH_RE =
  /audience in id token \[[^\]]+\] does not match the expected audience/i

function getErrorCode(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null
  }

  return 'code' in error && typeof (error as AuthErrorLike).code === 'string'
    ? (error as AuthErrorLike).code ?? null
    : null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as AuthErrorLike).message
    return typeof message === 'string' ? message : null
  }

  return null
}

export function formatAuthErrorMessage(error: unknown) {
  const code = getErrorCode(error)
  const message = getErrorMessage(error)

  if (code === 'ERR_REQUEST_CANCELED') {
    return 'Apple sign-in was canceled.'
  }

  if (code === 'auth/account-exists-with-different-credential') {
    return 'This email is already tied to a different sign-in method. Account linking is still being finished, so use your existing sign-in method for now.'
  }

  if (code === 'auth/network-request-failed') {
    return 'Sign-in could not reach the network right now. Check your connection and try again.'
  }

  if (message && APPLE_AUDIENCE_MISMATCH_RE.test(message)) {
    return "Apple Sign-In isn't fully wired for this build yet. The app ID and Firebase Apple setup still disagree. This is a configuration issue, not your account."
  }

  if (code === 'auth/invalid-credential') {
    return 'The sign-in credential could not be verified. Try again after refreshing this preview build or checking the Apple/Firebase setup.'
  }

  if (message) {
    return message
  }

  return 'Unable to sign in right now.'
}
