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
import { setAuthTokenProvider } from 'components/data/api/shared'

type AuthContextValue = {
  isReady: boolean
  user: User | null
  canUseFirebaseAuth: boolean
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
  }, [canUseFirebaseAuth])

  useEffect(() => {
    let isMounted = true

    if (!canUseFirebaseAuth || Platform.OS !== 'ios') {
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
  }, [canUseFirebaseAuth])

  const signInWithApple = useCallback(async () => {
    if (!canUseFirebaseAuth) {
      throw new Error('Firebase is not configured.')
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
  }, [canUseFirebaseAuth])

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
  }, [canUseFirebaseAuth])

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
    },
    [canUseFirebaseAuth]
  )

  const signOutUser = useCallback(async () => {
    if (!canUseFirebaseAuth) return
    await signOut(getFirebaseAuth())
    queryClient.clear()
  }, [canUseFirebaseAuth, queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      user,
      canUseFirebaseAuth,
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
