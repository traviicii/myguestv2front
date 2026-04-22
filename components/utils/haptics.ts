import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'

const isIos = Platform.OS === 'ios'

async function runHaptic(action: () => Promise<void>) {
  if (!isIos) return

  try {
    await action()
  } catch {
    // Haptics are additive polish only. Fail silently so interaction flows
    // still work in simulators, preview builds, and unsupported environments.
  }
}

export function selectionHaptic() {
  return runHaptic(() => Haptics.selectionAsync())
}

export function impactLightHaptic() {
  return runHaptic(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  )
}

export function impactMediumHaptic() {
  return runHaptic(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  )
}

export function successHaptic() {
  return runHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  )
}

export function warningHaptic() {
  return runHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  )
}
