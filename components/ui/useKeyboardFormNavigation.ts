import { useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

type FocusableField = { focus?: () => void } | null

const FOCUS_SCROLL_TOLERANCE = 24
const IOS_KEYBOARD_SETTLE_DELAY_MS = 72
const ANDROID_KEYBOARD_SETTLE_DELAY_MS = 48

export function useKeyboardFormNavigation<Field extends string>({
  fields,
  focusAdjacentAfterScrollDelayMs = 0,
  getFocusOffset,
  resolveFieldTarget,
}: {
  fields: readonly Field[]
  focusAdjacentAfterScrollDelayMs?: number
  getFocusOffset: (field: Field) => number
  resolveFieldTarget: (field: Field) => number | undefined
}) {
  const scrollRef = useRef<any>(null)
  const scrollY = useRef(0)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardVisible = useRef(false)
  const inputRefs = useRef<Partial<Record<Field, FocusableField>>>({})
  const activeField = useRef<Field | null>(null)
  const programmaticFocus = useRef(false)
  const [activeKeyboardField, setActiveKeyboardField] = useState<Field | null>(null)

  const keyboardDismissMode =
    Platform.OS === 'ios'
      ? ('interactive' as const)
      : ('on-drag' as const)

  const clearPendingScroll = useCallback(() => {
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
  }, [])

  const clearPendingFocus = useCallback(() => {
    if (focusTimeoutRef.current !== null) {
      clearTimeout(focusTimeoutRef.current)
      focusTimeoutRef.current = null
    }
  }, [])

  const setFocusedKeyboardField = useCallback((field: Field | null) => {
    activeField.current = field
    setActiveKeyboardField(field)
  }, [])

  const scrollFieldIntoView = useCallback(
    (field: Field, options?: { animated?: boolean; delayMs?: number }) => {
      const targetY = resolveFieldTarget(field)
      if (typeof targetY !== 'number') return

      const nextScrollY = Math.max(0, targetY - getFocusOffset(field))
      if (Math.abs(scrollY.current - nextScrollY) < FOCUS_SCROLL_TOLERANCE) {
        return false
      }

      clearPendingScroll()
      const delay =
        options?.delayMs ??
        (keyboardVisible.current
          ? Platform.OS === 'ios'
            ? 12
            : 20
          : Platform.OS === 'ios'
            ? 72
            : 36)

      scrollTimeoutRef.current = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: nextScrollY,
          animated: options?.animated ?? true,
        })
        scrollTimeoutRef.current = null
      }, delay)

      return true
    },
    [clearPendingScroll, getFocusOffset, resolveFieldTarget]
  )

  const setInputRef = useCallback(
    (field: Field) => (instance: FocusableField) => {
      inputRefs.current[field] = instance
    },
    []
  )

  const focusKeyboardField = useCallback((field: Field) => {
    inputRefs.current[field]?.focus?.()
  }, [])

  const handleKeyboardFieldFocus = useCallback(
    (field: Field) => {
      setFocusedKeyboardField(field)
      if (programmaticFocus.current) {
        programmaticFocus.current = false
        return
      }
      if (keyboardVisible.current) {
        scrollFieldIntoView(field, { delayMs: 20 })
      }
    },
    [scrollFieldIntoView, setFocusedKeyboardField]
  )

  const handleKeyboardFieldBlur = useCallback(
    (field: Field) => {
      if (activeField.current === field) {
        setFocusedKeyboardField(null)
      }
    },
    [setFocusedKeyboardField]
  )

  const focusAdjacentKeyboardField = useCallback(
    (direction: 'previous' | 'next') => {
      const currentField = activeField.current ?? activeKeyboardField
      if (!currentField) return

      const currentIndex = fields.indexOf(currentField)
      if (currentIndex === -1) return

      const nextIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1
      const targetField = fields[nextIndex]
      if (!targetField) return

      setFocusedKeyboardField(targetField)
      clearPendingFocus()
      clearPendingScroll()

      const focusTargetField = () => {
        programmaticFocus.current = true
        focusKeyboardField(targetField)
        setTimeout(() => {
          programmaticFocus.current = false
        }, 80)
      }

      if (keyboardVisible.current && focusAdjacentAfterScrollDelayMs > 0) {
        const didScroll = scrollFieldIntoView(targetField, { delayMs: 0 })
        if (didScroll) {
          focusTimeoutRef.current = setTimeout(() => {
            focusTargetField()
            focusTimeoutRef.current = null
          }, focusAdjacentAfterScrollDelayMs)
          return
        }
      }

      requestAnimationFrame(() => {
        focusTargetField()
        if (keyboardVisible.current) {
          scrollFieldIntoView(targetField, { delayMs: 0 })
        }
      })
    },
    [
      activeKeyboardField,
      clearPendingFocus,
      clearPendingScroll,
      fields,
      focusAdjacentAfterScrollDelayMs,
      focusKeyboardField,
      scrollFieldIntoView,
      setFocusedKeyboardField,
    ]
  )

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.current = event.nativeEvent.contentOffset.y
  }, [])

  const handleScrollBeginDrag = useCallback(() => {
    setFocusedKeyboardField(null)
    Keyboard.dismiss()
    clearPendingScroll()
    clearPendingFocus()
  }, [clearPendingFocus, clearPendingScroll, setFocusedKeyboardField])

  useEffect(
    () => () => {
      clearPendingScroll()
      clearPendingFocus()
    },
    [clearPendingFocus, clearPendingScroll]
  )

  useEffect(() => {
    const handleKeyboardShow = () => {
      keyboardVisible.current = true
      if (activeField.current) {
        scrollFieldIntoView(activeField.current, {
          delayMs: Platform.OS === 'ios'
            ? IOS_KEYBOARD_SETTLE_DELAY_MS
            : ANDROID_KEYBOARD_SETTLE_DELAY_MS,
        })
      }
    }

    const handleKeyboardHide = () => {
      keyboardVisible.current = false
      setFocusedKeyboardField(null)
      clearPendingScroll()
      clearPendingFocus()
    }

    const showSub = Keyboard.addListener('keyboardDidShow', handleKeyboardShow)
    const hideSub = Keyboard.addListener('keyboardDidHide', handleKeyboardHide)

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [clearPendingFocus, clearPendingScroll, scrollFieldIntoView, setFocusedKeyboardField])

  const activeKeyboardFieldIndex = activeKeyboardField
    ? fields.indexOf(activeKeyboardField)
    : -1

  return {
    activeKeyboardField,
    canGoToNextKeyboardField:
      activeKeyboardFieldIndex >= 0 && activeKeyboardFieldIndex < fields.length - 1,
    canGoToPreviousKeyboardField: activeKeyboardFieldIndex > 0,
    clearPendingScroll,
    focusKeyboardField,
    focusAdjacentKeyboardField,
    handleKeyboardFieldBlur,
    handleKeyboardFieldFocus,
    handleScroll,
    handleScrollBeginDrag,
    keyboardDismissMode,
    scrollFieldIntoView,
    scrollRef,
    setFocusedKeyboardField,
    setInputRef,
  }
}
