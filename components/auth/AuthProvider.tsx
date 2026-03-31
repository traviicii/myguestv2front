// Auth provider wraps Firebase auth and exposes a thin, app-friendly API.
// It also wires the API client to the current token so network calls stay authenticated.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Platform } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import {
  GoogleAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import {
  getFirebaseAuth,
  getMissingFirebaseConfigKeys,
  isFirebaseConfigured,
} from './firebaseClient'
import {
  hasStaticDevToken,
  setAuthTokenProvider,
} from 'components/data/api/shared'
import { APPLE_SIGN_IN_ENABLED } from 'components/data/config'

const DEV_AUTH_BYPASS_DISABLED_KEY = 'myguest:dev-auth-bypass-disabled'

type AuthContextValue = {
  isReady: boolean
  user: User | null
  canUseFirebaseAuth: boolean
  canUseDevTokenFallback: boolean
  isDevTokenFallbackReady: boolean
  isAppleAuthAvailable: boolean
  missingFirebaseConfigKeys: string[]
  authError: string | null
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGoogleIdToken: (idToken: string) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const canUseFirebaseAuth = isFirebaseConfigured()
  const missingFirebaseConfigKeys = useMemo(
    () => getMissingFirebaseConfigKeys(),
    []
  )
  const [isReady, setIsReady] = useState(!canUseFirebaseAuth)
  const [user, setUser] = useState<User | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false)
  const [isDevTokenFallbackReady, setIsDevTokenFallbackReady] = useState(!hasStaticDevToken())
  const [isDevTokenFallbackDisabled, setIsDevTokenFallbackDisabled] = useState(false)
  const canUseDevTokenFallback = hasStaticDevToken() && !isDevTokenFallbackDisabled

  const persistDevTokenFallbackDisabled = useCallback(async (disabled: boolean) => {
    setIsDevTokenFallbackDisabled(disabled)
    if (!hasStaticDevToken()) {
      setIsDevTokenFallbackReady(true)
      return
    }

    try {
      if (disabled) {
        await AsyncStorage.setItem(DEV_AUTH_BYPASS_DISABLED_KEY, 'true')
      } else {
        await AsyncStorage.removeItem(DEV_AUTH_BYPASS_DISABLED_KEY)
      }
    } finally {
      setIsDevTokenFallbackReady(true)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    if (!hasStaticDevToken()) {
      setIsDevTokenFallbackDisabled(false)
      setIsDevTokenFallbackReady(true)
      return () => {
        isMounted = false
      }
    }

    AsyncStorage.getItem(DEV_AUTH_BYPASS_DISABLED_KEY)
      .then((value) => {
        if (!isMounted) return
        setIsDevTokenFallbackDisabled(value === 'true')
        setIsDevTokenFallbackReady(true)
      })
      .catch(() => {
        if (!isMounted) return
        setIsDevTokenFallbackDisabled(false)
        setIsDevTokenFallbackReady(true)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!canUseFirebaseAuth) {
      setAuthTokenProvider(null)
      setIsReady(true)
      return
    }

    const auth = getFirebaseAuth()
    setAuthTokenProvider(async () => auth.currentUser?.getIdToken() ?? null)

    if (Platform.OS === 'web') {
      // Explicit persistence improves token refresh behavior on web builds.
      setPersistence(auth, browserLocalPersistence).catch(() => {
        // Session will still work without explicit persistence, but token refresh
        // behavior is better when local persistence is available.
      })
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser)
        setIsReady(true)
        setAuthError(null)
        if (nextUser) {
          void persistDevTokenFallbackDisabled(false)
        }
      },
      (error) => {
        setAuthError(error.message || 'Failed to read Firebase auth state.')
        setIsReady(true)
      }
    )

    return () => {
      // Ensure we do not keep a stale token provider around after sign out/unmount.
      unsubscribe()
      setAuthTokenProvider(null)
    }
  }, [canUseFirebaseAuth, persistDevTokenFallbackDisabled])

  useEffect(() => {
    let isMounted = true

    if (!APPLE_SIGN_IN_ENABLED || !canUseFirebaseAuth || Platform.OS !== 'ios') {
      setIsAppleAuthAvailable(false)
      return () => {
        isMounted = false
      }
    }

    AppleAuthentication.isAvailableAsync()
      .then((isAvailable) => {
        if (!isMounted) return
        setIsAppleAuthAvailable(isAvailable)
      })
      .catch(() => {
        if (!isMounted) return
        setIsAppleAuthAvailable(false)
      })

    return () => {
      isMounted = false
    }
  }, [canUseFirebaseAuth, persistDevTokenFallbackDisabled])

  const signInWithApple = useCallback(async () => {
    if (!canUseFirebaseAuth) {
      throw new Error('Firebase is not configured.')
    }
    if (!APPLE_SIGN_IN_ENABLED) {
      throw new Error(
        __DEV__
          ? 'Sign in with Apple is disabled for this local dev build. Rebuild with EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN=true once your paid Apple Developer team is ready.'
          : 'Sign in with Apple is unavailable in this build.'
      )
    }
    if (Platform.OS !== 'ios') {
      throw new Error('Sign in with Apple is available on iPhone only.')
    }

    try {
      const rawNonce = Crypto.randomUUID()
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
        nonce: rawNonce,
      })

      if (!credential.identityToken) {
        throw new Error('Apple sign-in did not return an identity token.')
      }

      const auth = getFirebaseAuth()
      const provider = new OAuthProvider('apple.com')
      const firebaseCredential = provider.credential({
        idToken: credential.identityToken,
        rawNonce,
      })

      await signInWithCredential(auth, firebaseCredential)
      await auth.currentUser?.getIdToken(true)
      await persistDevTokenFallbackDisabled(false)
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ERR_REQUEST_CANCELED'
      ) {
        throw new Error('Apple sign-in was canceled.')
      }
      throw error
    }
  }, [canUseFirebaseAuth, persistDevTokenFallbackDisabled])

  const signInWithGoogle = useCallback(async () => {
    if (!canUseFirebaseAuth) {
      throw new Error('Firebase is not configured.')
    }
    if (Platform.OS !== 'web') {
      // Native Google sign-in is not wired yet; guard to avoid misleading UX.
      throw new Error(
        'Google sign-in is currently implemented for web. Use Expo web for now.'
      )
    }

    const auth = getFirebaseAuth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
    await auth.currentUser?.getIdToken(true)
    await persistDevTokenFallbackDisabled(false)
  }, [canUseFirebaseAuth, persistDevTokenFallbackDisabled])

  const signInWithGoogleIdToken = useCallback(
    async (idToken: string) => {
      if (!canUseFirebaseAuth) {
        throw new Error('Firebase is not configured.')
      }
      if (!idToken) {
        throw new Error('Google sign-in did not return an ID token.')
      }

      const auth = getFirebaseAuth()
      const credential = GoogleAuthProvider.credential(idToken)
      await signInWithCredential(auth, credential)
      await auth.currentUser?.getIdToken(true)
      await persistDevTokenFallbackDisabled(false)
    },
    [canUseFirebaseAuth, persistDevTokenFallbackDisabled]
  )

  const signOutUser = useCallback(async () => {
    await persistDevTokenFallbackDisabled(true)
    if (!canUseFirebaseAuth) return
    await signOut(getFirebaseAuth())
    queryClient.clear()
  }, [canUseFirebaseAuth, persistDevTokenFallbackDisabled, queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      user,
      canUseFirebaseAuth,
      canUseDevTokenFallback,
      isDevTokenFallbackReady,
      isAppleAuthAvailable,
      missingFirebaseConfigKeys,
      authError,
      signInWithApple,
      signInWithGoogle,
      signInWithGoogleIdToken,
      signOutUser,
    }),
    [
      authError,
      canUseFirebaseAuth,
      canUseDevTokenFallback,
      isDevTokenFallbackReady,
      isAppleAuthAvailable,
      isReady,
      missingFirebaseConfigKeys,
      signInWithApple,
      signInWithGoogle,
      signInWithGoogleIdToken,
      signOutUser,
      user,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }
  return context
}
