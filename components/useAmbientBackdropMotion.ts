import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

const createAmbientLoop = (value: Animated.Value, duration: number) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: -1,
        duration,
        useNativeDriver: true,
      }),
    ])
  )

const createSheenLoop = (value: Animated.Value) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration: 4200,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 4200,
        useNativeDriver: true,
      }),
    ])
  )

const resetAmbientValue = (value: Animated.Value) => {
  value.stopAnimation()
  value.setValue(0)
}

export function useAmbientBackdropMotion(enabled: boolean) {
  const drift = useRef(new Animated.Value(0)).current
  const sheen = useRef(new Animated.Value(0)).current
  const blob = useRef(new Animated.Value(0)).current

  useEffect(() => {
    resetAmbientValue(drift)
    resetAmbientValue(sheen)
    resetAmbientValue(blob)

    if (!enabled) {
      return
    }

    const driftLoop = createAmbientLoop(drift, 6400)
    const sheenLoop = createSheenLoop(sheen)
    const blobLoop = createAmbientLoop(blob, 14000)

    driftLoop.start()
    sheenLoop.start()
    blobLoop.start()

    return () => {
      driftLoop.stop()
      sheenLoop.stop()
      blobLoop.stop()
    }
  }, [blob, drift, enabled, sheen])

  return {
    drift,
    sheen,
    blob,
  }
}
