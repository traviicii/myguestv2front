import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ActivityIndicator, Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { Text, YStack } from 'tamagui'
import { PrimaryButton, SecondaryButton } from 'components/ui/controls'
import { hasStaticDevToken } from 'components/data/api'
import { useAuth } from './AuthProvider'

WebBrowser.maybeCompleteAuthSession()

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
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim()
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim()
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: iosClientId || undefined,
    androidClientId: androidClientId || undefined,
    webClientId: webClientId || undefined,
    selectAccount: true,
  })

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
