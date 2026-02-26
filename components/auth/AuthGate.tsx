import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ActivityIndicator, Platform } from 'react-native'
import Constants from 'expo-constants'
import * as WebBrowser from 'expo-web-browser'
import { Text, YStack } from 'tamagui'
import { PrimaryButton, SecondaryButton } from 'components/ui/controls'
import { hasStaticDevToken } from 'components/data/api'
import { useAuth } from './AuthProvider'

WebBrowser.maybeCompleteAuthSession()

type GoogleAuthHookResult = [
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
  googleProviderModule =
    require('expo-auth-session/providers/google') as GoogleProviderModule
} catch (error) {
  googleProviderLoadError =
    error instanceof Error
      ? error.message
      : 'Unable to load native Google auth module.'
}

export function AuthGate({ children }: { children: ReactNode }) {
  const {
    isReady,
    user,
    canUseFirebaseAuth,
    missingFirebaseConfigKeys,
    authError,
    signInWithGoogle,
    signInWithGoogleIdToken,
  } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const isExpoGo = Constants.executionEnvironment === 'storeClient'
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim()
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim()
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()
  const nativeRedirectUri = useMemo(() => {
    if (Platform.OS === 'ios') {
      const bundleId = Constants.expoConfig?.ios?.bundleIdentifier?.trim()
      return bundleId ? `${bundleId}:/oauthredirect` : undefined
    }
    if (Platform.OS === 'android') {
      const packageName = Constants.expoConfig?.android?.package?.trim()
      return packageName ? `${packageName}:/oauthredirect` : undefined
    }
    return undefined
  }, [])
  const [request, response, promptAsync] = googleProviderModule
    ? googleProviderModule.useIdTokenAuthRequest({
        iosClientId: iosClientId || undefined,
        androidClientId: androidClientId || undefined,
        webClientId: webClientId || undefined,
        selectAccount: true,
      }, nativeRedirectUri ? { native: nativeRedirectUri } : undefined)
    : [null, null, async () => null]

  const canUseDevTokenFallback = hasStaticDevToken()
  const missingGoogleClientIds = useMemo(() => {
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
  }, [androidClientId, iosClientId, webClientId])
  const nativeGoogleUnavailable =
    Platform.OS !== 'web' && !googleProviderModule
  const isNativeAuthBlockedInExpoGo = Platform.OS !== 'web' && isExpoGo

  useEffect(() => {
    if (response?.type !== 'success') {
      return
    }

    const idToken = response.params?.id_token
    if (!idToken) {
      setLoginError('Google sign-in did not return an ID token.')
      return
    }

    let isMounted = true
    setIsSigningIn(true)
    setLoginError(null)

    signInWithGoogleIdToken(idToken)
      .catch((error) => {
        if (!isMounted) return
        setLoginError(
          error instanceof Error ? error.message : 'Unable to sign in right now.'
        )
      })
      .finally(() => {
        if (!isMounted) return
        setIsSigningIn(false)
      })

    return () => {
      isMounted = false
    }
  }, [response, signInWithGoogleIdToken])

  if (canUseFirebaseAuth) {
    if (!isReady) {
      return (
        <YStack flex={1} items="center" justify="center" gap="$3">
          <ActivityIndicator />
          <Text fontSize={12} color="$gray8">
            Checking session...
          </Text>
        </YStack>
      )
    }

    if (user) {
      return <>{children}</>
    }

    return (
      <YStack flex={1} px="$6" items="center" justify="center" gap="$4">
        <YStack gap="$2" items="center">
          <Text fontSize={20} fontWeight="700">
            Sign In
          </Text>
          <Text fontSize={12} color="$gray8" style={{ textAlign: 'center' }}>
            Use your Google account to access your MyGuest v2 data.
          </Text>
        </YStack>
        <PrimaryButton
          width={220}
          disabled={
            isSigningIn ||
            (!request &&
              Platform.OS !== 'web' &&
              missingGoogleClientIds.length === 0)
          }
          onPress={async () => {
            setLoginError(null)
            setIsSigningIn(true)
            try {
              if (Platform.OS === 'web') {
                await signInWithGoogle()
                return
              }
              if (missingGoogleClientIds.length > 0) {
                throw new Error(
                  `Missing ${missingGoogleClientIds.join(', ')} in .env.`
                )
              }
              if (nativeGoogleUnavailable) {
                throw new Error(
                  'Native Google sign-in is unavailable in this build. Run `npx expo install expo-auth-session` and rebuild iOS.'
                )
              }
              if (isNativeAuthBlockedInExpoGo) {
                throw new Error(
                  'Google sign-in on native requires a dev build, not Expo Go. Run `npx expo run:ios` and open the built app.'
                )
              }
              await promptAsync()
            } catch (error) {
              setLoginError(
                error instanceof Error ? error.message : 'Unable to sign in right now.'
              )
            } finally {
              setIsSigningIn(false)
            }
          }}
        >
          <Text color="$accentContrast" fontWeight="600">
            {isSigningIn ? 'Signing In...' : 'Continue With Google'}
          </Text>
        </PrimaryButton>
        {missingGoogleClientIds.length > 0 ? (
          <Text fontSize={11} color="$gray8" style={{ textAlign: 'center' }}>
            Missing {missingGoogleClientIds.join(', ')}.
          </Text>
        ) : null}
        {isNativeAuthBlockedInExpoGo ? (
          <Text fontSize={11} color="$gray8" style={{ textAlign: 'center' }}>
            Native Google sign-in is blocked in Expo Go. Use a development build.
          </Text>
        ) : null}
        {nativeGoogleUnavailable && googleProviderLoadError ? (
          <Text fontSize={11} color="$gray8" style={{ textAlign: 'center' }}>
            {googleProviderLoadError}
          </Text>
        ) : null}
        {loginError || authError ? (
          <Text fontSize={11} color="$red10" style={{ textAlign: 'center' }}>
            {loginError || authError}
          </Text>
        ) : null}
      </YStack>
    )
  }

  if (canUseDevTokenFallback) {
    return <>{children}</>
  }

  return (
    <YStack flex={1} px="$6" items="center" justify="center" gap="$4">
      <YStack gap="$2" items="center">
        <Text fontSize={18} fontWeight="700">
          Firebase Config Required
        </Text>
        <Text fontSize={12} color="$gray8" style={{ textAlign: 'center' }}>
          Add Firebase web config values in `.env` to enable login.
        </Text>
      </YStack>
      <YStack gap="$1.5" width="100%" maxW={520}>
        {missingFirebaseConfigKeys.map((key) => (
          <Text key={key} fontSize={11} color="$gray8">
            - {key}
          </Text>
        ))}
      </YStack>
      <SecondaryButton disabled>
        Waiting for Firebase env vars
      </SecondaryButton>
    </YStack>
  )
}
