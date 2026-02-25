import { useEffect, useRef, useState } from 'react'
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated'

export const PANEL_BOX_DELAY = 120
export const PANEL_BOX_DURATION = 280
const SPRING_DELAY = 140

type ExpandablePanelOptions = {
  hideDelayMs?: number
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
  const hideDelay = options.hideDelayMs ?? PANEL_BOX_DURATION + 140

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
        PANEL_BOX_DELAY,
        withTiming(measured || 0, {
          duration: PANEL_BOX_DURATION,
          easing: Easing.out(Easing.cubic),
        })
      )
      springTimeout.current = setTimeout(() => {
        height.value = withSpring(measured || 0, {
          damping: 26,
          stiffness: 200,
          mass: 0.5,
        })
      }, SPRING_DELAY)
    } else {
      if (springTimeout.current) {
        clearTimeout(springTimeout.current)
      }
      height.value = withTiming(0, {
        duration: PANEL_BOX_DURATION,
        easing: Easing.in(Easing.cubic),
      })
      springTimeout.current = setTimeout(() => {
        height.value = withSpring(0, {
          damping: 26,
          stiffness: 200,
          mass: 0.5,
        })
      }, SPRING_DELAY)
      hideTimeout.current = setTimeout(() => {
        setShowPanel(false)
      }, hideDelay)
    }
  }, [height, hideDelay, measured, visible])

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
