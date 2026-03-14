import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

export type GoogleAuthHookResult = [
  unknown,
  { type: string; params?: Record<string, string> } | null,
  () => Promise<unknown>,
]

type GoogleProviderModule = {
  useIdTokenAuthRequest: (
    config: {
      iosClientId?: string
      androidClientId?: string
      webClientId?: string
      selectAccount?: boolean
    },
    redirectUriOptions?: {
      native?: string
    }
  ) => GoogleAuthHookResult
}

let googleProviderModule: GoogleProviderModule | null = null
let googleProviderLoadError: string | null = null

try {
  // Load lazily so an incompatible native module doesn't crash the whole app.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  googleProviderModule = require('expo-auth-session/providers/google') as GoogleProviderModule
} catch (error) {
  googleProviderLoadError =
    error instanceof Error
      ? error.message
      : 'Unable to load native Google auth module.'
}

export function getIosNativeRedirectUri(iosClientId?: string) {
  if (Platform.OS !== 'ios' || !iosClientId) return undefined
  const suffix = '.apps.googleusercontent.com'
  if (!iosClientId.endsWith(suffix)) return undefined
  const clientPart = iosClientId.slice(0, -suffix.length)
  if (!clientPart) return undefined
  return `com.googleusercontent.apps.${clientPart}:/oauthredirect`
}

export function getMissingGoogleClientIds({
  androidClientId,
  iosClientId,
  webClientId,
}: {
  androidClientId?: string
  iosClientId?: string
  webClientId?: string
}) {
  const missing: string[] = []
  if (Platform.OS === 'ios' && !iosClientId) {
    missing.push('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID')
  }
  if (Platform.OS === 'android' && !androidClientId) {
    missing.push('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID')
  }
  if (Platform.OS === 'web' && !webClientId) {
    missing.push('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID')
  }
  return missing
}

export function getGoogleAuthRequest({
  androidClientId,
  iosClientId,
  webClientId,
}: {
  androidClientId?: string
  iosClientId?: string
  webClientId?: string
}): GoogleAuthHookResult {
  const nativeRedirectUri = getIosNativeRedirectUri(iosClientId)
  return googleProviderModule
    ? googleProviderModule.useIdTokenAuthRequest(
        {
          iosClientId: iosClientId || undefined,
          androidClientId: androidClientId || undefined,
          webClientId: webClientId || undefined,
          selectAccount: true,
        },
        nativeRedirectUri ? { native: nativeRedirectUri } : undefined
      )
    : ([null, null, async () => null] as GoogleAuthHookResult)
}

export { googleProviderLoadError, googleProviderModule }
