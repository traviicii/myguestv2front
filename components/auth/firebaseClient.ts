import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim(),
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null

export function isFirebaseConfigured() {
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

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase config is incomplete. Check Expo public environment variables.')
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }

  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp)
  }

  return firebaseAuth
}
