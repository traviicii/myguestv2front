import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

import { hasStaticDevToken } from 'components/data/api/shared'

import { useAuth } from './AuthProvider'
import {
  getGoogleAuthRequest,
  getMissingGoogleClientIds,
  googleProviderLoadError,
  googleProviderModule,
} from './authGateConfig'
import {
  AuthLoadingState,
  FirebaseConfigRequiredView,
  SignInRequiredView,
} from './AuthGateViews'

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
  const [request, response, promptAsync] = getGoogleAuthRequest({
    androidClientId,
    iosClientId,
    webClientId,
  })

  const canUseDevTokenFallback = hasStaticDevToken()
  const missingGoogleClientIds = useMemo(
    () => getMissingGoogleClientIds({ androidClientId, iosClientId, webClientId }),
    [androidClientId, iosClientId, webClientId]
  )
  const nativeGoogleUnavailable = Platform.OS !== 'web' && !googleProviderModule
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

  const handleContinueWithGoogle = async () => {
    setLoginError(null)
    setIsSigningIn(true)
    try {
      if (Platform.OS === 'web') {
        await signInWithGoogle()
        return
      }
      if (missingGoogleClientIds.length > 0) {
        throw new Error(`Missing ${missingGoogleClientIds.join(', ')} in .env.`)
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
  }

  if (canUseFirebaseAuth) {
    if (!isReady) {
      return <AuthLoadingState />
    }

    if (user) {
      return <>{children}</>
    }

    return (
      <SignInRequiredView
        authError={authError}
        googleProviderLoadError={googleProviderLoadError}
        isNativeAuthBlockedInExpoGo={isNativeAuthBlockedInExpoGo}
        isSigningIn={isSigningIn}
        loginError={loginError}
        missingGoogleClientIds={missingGoogleClientIds}
        nativeGoogleUnavailable={nativeGoogleUnavailable}
        onContinueWithGoogle={handleContinueWithGoogle}
        requestAvailable={Boolean(request) || Platform.OS === 'web'}
      />
    )
  }

  if (canUseDevTokenFallback) {
    return <>{children}</>
  }

  return <FirebaseConfigRequiredView missingFirebaseConfigKeys={missingFirebaseConfigKeys} />
}
