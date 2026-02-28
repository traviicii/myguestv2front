import { useEffect, useRef, useState } from 'react'
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated'

export const PANEL_BOX_DELAY = 120
export const PANEL_BOX_DURATION = 280
const SPRING_DELAY = 140

type ExpandablePanelOptions = {
  hideDelayMs?: number
  panelDelayMs?: number
  panelDurationMs?: number
  springDelayMs?: number
  springConfig?: {
    damping?: number
    stiffness?: number
    mass?: number
  }
}

export const useExpandablePanel = (
  visible: boolean,
  options: ExpandablePanelOptions = {}
) => {
  const [measured, setMeasured] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const height = useSharedValue(0)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const springTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelDelay = options.panelDelayMs ?? PANEL_BOX_DELAY
  const panelDuration = options.panelDurationMs ?? PANEL_BOX_DURATION
  const springDelay = options.springDelayMs ?? SPRING_DELAY
  const springDamping = options.springConfig?.damping ?? 26
  const springStiffness = options.springConfig?.stiffness ?? 200
  const springMass = options.springConfig?.mass ?? 0.5
  const hideDelay = options.hideDelayMs ?? panelDuration + 140

  useEffect(() => {
    if (visible) {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current)
      }
      if (springTimeout.current) {
        clearTimeout(springTimeout.current)
      }
      setShowPanel(true)
      height.value = withDelay(
        panelDelay,
        withTiming(measured || 0, {
          duration: panelDuration,
          easing: Easing.out(Easing.cubic),
        })
      )
      springTimeout.current = setTimeout(() => {
        height.value = withSpring(measured || 0, {
          damping: springDamping,
          stiffness: springStiffness,
          mass: springMass,
        })
      }, springDelay)
    } else {
      if (springTimeout.current) {
        clearTimeout(springTimeout.current)
      }
      height.value = withTiming(0, {
        duration: panelDuration,
        easing: Easing.in(Easing.cubic),
      })
      springTimeout.current = setTimeout(() => {
        height.value = withSpring(0, {
          damping: springDamping,
          stiffness: springStiffness,
          mass: springMass,
        })
      }, springDelay)
      hideTimeout.current = setTimeout(() => {
        setShowPanel(false)
      }, hideDelay)
    }
  }, [
    height,
    hideDelay,
    measured,
    panelDelay,
    panelDuration,
    springDamping,
    springStiffness,
    springMass,
    springDelay,
    visible,
  ])

  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current)
      }
      if (springTimeout.current) {
        clearTimeout(springTimeout.current)
      }
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }))

  return {
    animatedStyle,
    setMeasured,
    showPanel,
  }
}
