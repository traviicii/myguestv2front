import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createJSONStorage, type StateStorage } from 'zustand/middleware'

// Zustand expects a storage-like object. On web we map to localStorage and
// guard for SSR; on native we use AsyncStorage.
const webStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(name)
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(name, value)
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(name)
  },
}

// Single storage adapter shared by all persisted stores in this app.
export const zustandStorage = createJSONStorage(() =>
  Platform.OS === 'web' ? webStorage : AsyncStorage
)
