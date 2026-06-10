import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  type Auth,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import { USE_MOCK_DATA } from 'components/data/config'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
    (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim()
      ? `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID.trim()}.appspot.com`
      : undefined),
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim(),
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null

function isAlreadyInitializedAuthError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  return (
    'code' in error &&
    (error as { code?: string }).code === 'auth/already-initialized'
  )
}

function getReactNativePersistenceFactory() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const authModule = require('firebase/auth') as {
    getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown
  }
  return authModule.getReactNativePersistence
}

export function isFirebaseConfigured() {
  if (USE_MOCK_DATA) {
    return false
  }
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  )
}

export function getMissingFirebaseConfigKeys() {
  const missing: string[] = []
  if (!firebaseConfig.apiKey) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY')
  if (!firebaseConfig.authDomain) missing.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN')
  if (!firebaseConfig.projectId) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID')
  if (!firebaseConfig.appId) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID')
  return missing
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase config is incomplete. Check Expo public environment variables.')
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }

  return firebaseApp
}

export function getFirebaseAuth() {
  const app = getFirebaseApp()

  if (!firebaseAuth) {
    if (Platform.OS === 'web') {
      firebaseAuth = getAuth(app)
    } else {
      try {
        const persistenceFactory = getReactNativePersistenceFactory()
        const persistence = persistenceFactory
          ? persistenceFactory(AsyncStorage)
          : null

        firebaseAuth = initializeAuth(app, {
          ...(persistence ? { persistence: persistence as never } : {}),
        })
      } catch (error) {
        if (!isAlreadyInitializedAuthError(error)) {
          throw error
        }
        firebaseAuth = getAuth(app)
      }
    }
  }

  return firebaseAuth
}
