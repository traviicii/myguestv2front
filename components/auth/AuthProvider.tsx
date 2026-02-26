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
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import {
  getFirebaseAuth,
  getMissingFirebaseConfigKeys,
  isFirebaseConfigured,
} from './firebaseClient'
import { setAuthTokenProvider } from 'components/data/api'

type AuthContextValue = {
  isReady: boolean
  user: User | null
  canUseFirebaseAuth: boolean
  missingFirebaseConfigKeys: string[]
  authError: string | null
  signInWithGoogle: () => Promise<void>
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

  useEffect(() => {
    if (!canUseFirebaseAuth) {
      setAuthTokenProvider(null)
      setIsReady(true)
      return
    }

    const auth = getFirebaseAuth()
    setAuthTokenProvider(async () => auth.currentUser?.getIdToken() ?? null)

    if (Platform.OS === 'web') {
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
      unsubscribe()
      setAuthTokenProvider(null)
    }
  }, [canUseFirebaseAuth])

  const signInWithGoogle = useCallback(async () => {
    if (!canUseFirebaseAuth) {
      throw new Error('Firebase is not configured.')
    }
    if (Platform.OS !== 'web') {
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
      missingFirebaseConfigKeys,
      authError,
      signInWithGoogle,
      signOutUser,
    }),
    [
      authError,
      canUseFirebaseAuth,
      isReady,
      missingFirebaseConfigKeys,
      signInWithGoogle,
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
