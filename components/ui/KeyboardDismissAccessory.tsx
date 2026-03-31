import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useTheme } from 'tamagui'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

type KeyboardDismissAccessoryProps = {
  canGoNext?: boolean
  canGoPrevious?: boolean
  nativeID: string
  onNext?: () => void
  onPrevious?: () => void
}

export function KeyboardDismissAccessory({
  canGoNext = false,
  canGoPrevious = false,
  nativeID,
  onNext,
  onPrevious,
}: KeyboardDismissAccessoryProps) {
  const theme = useTheme() as any
  const [isVisible, setIsVisible] = useState(false)
  const bottom = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(10)).current

  void nativeID

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return
    }

    const animateBar = (keyboardHeight: number, duration = 220) => {
      Animated.parallel([
        Animated.timing(bottom, {
          toValue: keyboardHeight,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: keyboardHeight > 0 ? 1 : 0,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: keyboardHeight > 0 ? 0 : 10,
          duration,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished && keyboardHeight === 0) {
          setIsVisible(false)
        }
      })
    }

    const handleKeyboardFrame = (event: {
      duration?: number
      endCoordinates?: { height?: number }
    }) => {
      const keyboardHeight = Math.max(0, event.endCoordinates?.height ?? 0)
      if (keyboardHeight > 0) {
        setIsVisible(true)
      }
      animateBar(keyboardHeight, event.duration ?? 220)
    }

    const handleKeyboardHide = (event: { duration?: number }) => {
      animateBar(0, event.duration ?? 200)
    }

    const frameListener = Keyboard.addListener('keyboardWillChangeFrame', handleKeyboardFrame)
    const hideListener = Keyboard.addListener('keyboardWillHide', handleKeyboardHide)

    return () => {
      frameListener.remove()
      hideListener.remove()
    }
  }, [bottom, opacity, translateY])

  const backgroundColor = toNativeColor(theme.surfacePanel?.val, FALLBACK_COLORS.surfacePage)
  const borderColor = toNativeColor(theme.surfacePanelBorder?.val, FALLBACK_COLORS.borderSubtle)
  const textColor = toNativeColor(theme.accent?.val, FALLBACK_COLORS.textPrimary)
  if (Platform.OS !== 'ios' || !isVisible) return null

  return (
    <Animated.View
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        {
          bottom,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor,
            borderTopColor: borderColor,
          },
        ]}
      >
        <View style={styles.actions}>
          <Pressable
            onPress={onPrevious}
            accessibilityRole="button"
            accessibilityLabel="Focus previous field"
            style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
            disabled={!canGoPrevious || !onPrevious}
          >
            <ChevronUp
              size={16}
              color={canGoPrevious ? '$accent' : '$textSecondary'}
            />
          </Pressable>
          <Pressable
            onPress={onNext}
            accessibilityRole="button"
            accessibilityLabel="Focus next field"
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            disabled={!canGoNext || !onNext}
          >
            <ChevronDown
              size={16}
              color={canGoNext ? '$accent' : '$textSecondary'}
            />
          </Pressable>
          <Pressable
            onPress={Keyboard.dismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss keyboard"
            style={styles.doneButton}
          >
            <Text style={[styles.doneLabel, { color: textColor }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 50,
  },
  bar: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
    width: 32,
  },
  navButtonDisabled: {
    opacity: 0.45,
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
})
