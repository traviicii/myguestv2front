import { useCallback, useEffect, useRef, useState } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { Animated, Easing } from 'react-native'

type UsePullToRefreshOptions = {
  onRefreshAction: () => Promise<unknown>
  minRefreshMs?: number
  pullThreshold?: number
  successMessage?: string
  errorMessage?: string
  refreshingMessage?: string
  feedbackVisibleMs?: number
}

export function usePullToRefresh({
  onRefreshAction,
  minRefreshMs = 650,
  pullThreshold = 72,
  successMessage = 'Updated just now',
  errorMessage = 'Unable to refresh',
  refreshingMessage = 'Refreshing…',
  feedbackVisibleMs = 1800,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isPullActive, setIsPullActive] = useState(false)
  const [isThresholdReached, setIsThresholdReached] = useState(false)
  const isRefreshingRef = useRef(false)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pullActiveRef = useRef(false)
  const thresholdReachedRef = useRef(false)
  const pullProgress = useRef(new Animated.Value(0)).current

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = null
    }
  }, [])

  const setTimedFeedback = useCallback(
    (message: string | null) => {
      clearFeedbackTimer()
      setFeedbackMessage(message)
      if (!message) return
      feedbackTimerRef.current = setTimeout(() => {
        setFeedbackMessage((current) => (current === message ? null : current))
        feedbackTimerRef.current = null
      }, feedbackVisibleMs)
    },
    [clearFeedbackTimer, feedbackVisibleMs]
  )

  const resetPullAffordance = useCallback(() => {
    pullActiveRef.current = false
    thresholdReachedRef.current = false
    setIsPullActive(false)
    setIsThresholdReached(false)
    Animated.timing(pullProgress, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [pullProgress])

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return

    isRefreshingRef.current = true
    clearFeedbackTimer()
    setFeedbackMessage(refreshingMessage)
    setIsRefreshing(true)
    const startedAt = Date.now()

    try {
      await onRefreshAction()
      setTimedFeedback(successMessage)
    } catch (error) {
      console.warn('Pull-to-refresh failed', error)
      setTimedFeedback(errorMessage)
    } finally {
      const elapsed = Date.now() - startedAt
      if (elapsed < minRefreshMs) {
        await new Promise((resolve) => setTimeout(resolve, minRefreshMs - elapsed))
      }
      setIsRefreshing(false)
      isRefreshingRef.current = false
      resetPullAffordance()
    }
  }, [
    clearFeedbackTimer,
    errorMessage,
    minRefreshMs,
    onRefreshAction,
    refreshingMessage,
    resetPullAffordance,
    setTimedFeedback,
    successMessage,
  ])

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isRefreshingRef.current) return

      const pullDistance = Math.max(0, -event.nativeEvent.contentOffset.y)
      const nextProgress = Math.min(1, pullDistance / pullThreshold)
      pullProgress.setValue(nextProgress)

      const nextPullActive = pullDistance > 6
      if (nextPullActive !== pullActiveRef.current) {
        pullActiveRef.current = nextPullActive
        setIsPullActive(nextPullActive)
      }

      const nextThresholdReached = pullDistance >= pullThreshold
      if (nextThresholdReached !== thresholdReachedRef.current) {
        thresholdReachedRef.current = nextThresholdReached
        setIsThresholdReached(nextThresholdReached)
      }
    },
    [pullProgress, pullThreshold]
  )

  const handleScrollRelease = useCallback(() => {
    if (isRefreshingRef.current || thresholdReachedRef.current) return
    resetPullAffordance()
  }, [resetPullAffordance])

  useEffect(
    () => () => {
      clearFeedbackTimer()
    },
    [clearFeedbackTimer]
  )

  return {
    feedbackMessage,
    handleRefresh,
    handleScroll,
    handleScrollRelease,
    isPullActive,
    isRefreshing,
    isThresholdReached,
    pullProgress,
  }
}
