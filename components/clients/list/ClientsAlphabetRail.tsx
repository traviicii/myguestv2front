import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useTheme } from 'tamagui'

import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

import type { ClientsScreenModel } from '../useClientsScreenModel'

type ClientsAlphabetRailProps = {
  model: ClientsScreenModel
}

type AlphaLetter = ClientsScreenModel['alphaRailLetters'][number]

const ENTER_DURATION_MS = 170
const EXIT_DURATION_MS = 230
const HUD_HEIGHT = 42
const HUD_WIDTH = 54
const LETTER_CELL_HEIGHT = 14
const RAIL_TOUCH_WIDTH = 52
const RAIL_VERTICAL_PADDING = 8

export function ClientsAlphabetRail({ model }: ClientsAlphabetRailProps) {
  const theme = useTheme()
  const opacity = useRef(new Animated.Value(0)).current
  const translateX = useRef(new Animated.Value(12)).current
  const hudOpacity = useRef(new Animated.Value(0)).current
  const hudScale = useRef(new Animated.Value(0.94)).current
  const hudTranslateY = useRef(new Animated.Value(0)).current
  const activeIndexRef = useRef<number | null>(null)
  const lastJumpLetterRef = useRef<AlphaLetter | null>(null)
  const [activeLetter, setActiveLetter] = useState<AlphaLetter | null>(null)
  const [isRailDragging, setIsRailDragging] = useState(false)
  const [railHeight, setRailHeight] = useState(0)

  const accentColor = toNativeColor(theme.accent?.val, FALLBACK_COLORS.cyberAccent)
  const borderColor = toNativeColor(theme.borderSubtle?.val, FALLBACK_COLORS.borderSubtle)
  const mutedColor = toNativeColor(theme.textMuted?.val, FALLBACK_COLORS.textSecondary)
  const shadowColor = toNativeColor(theme.shadowColor?.val, FALLBACK_COLORS.shadowSoft)
  const surfaceColor = toNativeColor(theme.surfacePanel?.val, FALLBACK_COLORS.surfacePage)
  const textColor = toNativeColor(theme.textSecondary?.val, FALLBACK_COLORS.textSecondary)

  const getLetterCenterY = useCallback(
    (index: number) => {
      const letterCount = model.alphaRailLetters.length
      const firstCenter = RAIL_VERTICAL_PADDING + LETTER_CELL_HEIGHT / 2
      const lastCenter = Math.max(
        firstCenter,
        railHeight - RAIL_VERTICAL_PADDING - LETTER_CELL_HEIGHT / 2
      )

      if (letterCount <= 1) return firstCenter

      return firstCenter + ((lastCenter - firstCenter) * index) / (letterCount - 1)
    },
    [model.alphaRailLetters.length, railHeight]
  )

  const getHudTop = useCallback(
    (index: number) => {
      if (!railHeight) return 0

      const rawTop = getLetterCenterY(index) - HUD_HEIGHT / 2
      return Math.min(Math.max(rawTop, 0), Math.max(0, railHeight - HUD_HEIGHT))
    },
    [getLetterCenterY, railHeight]
  )

  const showHudAtIndex = useCallback(
    (index: number, options?: { immediate?: boolean }) => {
      if (!railHeight) return

      const top = getHudTop(index)
      hudOpacity.stopAnimation()
      hudScale.stopAnimation()
      hudTranslateY.stopAnimation()

      if (options?.immediate) {
        hudOpacity.setValue(1)
        hudScale.setValue(1)
        hudTranslateY.setValue(top)
        return
      }

      Animated.parallel([
        Animated.timing(hudTranslateY, {
          toValue: top,
          duration: 130,
          useNativeDriver: true,
        }),
        Animated.timing(hudOpacity, {
          toValue: 1,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.spring(hudScale, {
          toValue: 1,
          damping: 16,
          mass: 0.7,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]).start()
    },
    [getHudTop, hudOpacity, hudScale, hudTranslateY, railHeight]
  )

  const hideHud = useCallback(() => {
    activeIndexRef.current = null
    setActiveLetter(null)
    hudOpacity.stopAnimation()
    hudScale.stopAnimation()

    Animated.parallel([
      Animated.timing(hudOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(hudScale, {
        toValue: 0.94,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start()
  }, [hudOpacity, hudScale])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: model.alphaRailVisible ? 1 : 0,
        duration: model.alphaRailVisible ? ENTER_DURATION_MS : EXIT_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: model.alphaRailVisible ? 0 : 12,
        duration: model.alphaRailVisible ? ENTER_DURATION_MS : EXIT_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start()
  }, [model.alphaRailVisible, opacity, translateX])

  const resolveLetterFromY = useCallback(
    (locationY: number) => {
      if (!railHeight) return null

      const letterCount = model.alphaRailLetters.length
      const firstCenter = RAIL_VERTICAL_PADDING + LETTER_CELL_HEIGHT / 2
      const lastCenter = Math.max(
        firstCenter,
        railHeight - RAIL_VERTICAL_PADDING - LETTER_CELL_HEIGHT / 2
      )
      const clampedY = Math.min(Math.max(locationY, firstCenter), lastCenter)
      const exactIndex =
        letterCount <= 1
          ? 0
          : ((clampedY - firstCenter) / (lastCenter - firstCenter)) *
            (letterCount - 1)
      const index = Math.min(
        letterCount - 1,
        Math.max(0, Math.round(exactIndex))
      )
      const letter = model.alphaRailLetters[index]

      return letter ? { index, letter } : null
    },
    [model.alphaRailLetters, railHeight]
  )

  const activateLetterAtY = useCallback(
    (locationY: number) => {
      const resolved = resolveLetterFromY(locationY)
      if (!resolved) return

      showHudAtIndex(resolved.index, { immediate: true })

      if (activeIndexRef.current !== resolved.index) {
        activeIndexRef.current = resolved.index
        setActiveLetter(resolved.letter)
      }

      if (
        lastJumpLetterRef.current === resolved.letter ||
        !model.availableAlphaLetters.has(resolved.letter)
      ) {
        return
      }

      lastJumpLetterRef.current = resolved.letter
      model.jumpToLetter(resolved.letter)
    },
    [model, resolveLetterFromY, showHudAtIndex]
  )

  const releaseRail = useCallback(() => {
    const activeIndex = activeIndexRef.current
    const activeLetterValue =
      activeIndex === null ? null : model.alphaRailLetters[activeIndex]

    lastJumpLetterRef.current = null
    setIsRailDragging(false)
    model.handleAlphaRailInteractionEnd()

    if (activeIndex !== null && activeLetterValue) {
      setActiveLetter(activeLetterValue)
      showHudAtIndex(activeIndex)
      return
    }

    if (model.alphaRailFocusedIndex !== null && model.alphaRailFocusedLetter) {
      activeIndexRef.current = model.alphaRailFocusedIndex
      setActiveLetter(model.alphaRailFocusedLetter)
      showHudAtIndex(model.alphaRailFocusedIndex)
      return
    }

    hideHud()
  }, [hideHud, model, showHudAtIndex])

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => model.alphaRailVisible,
        onMoveShouldSetPanResponder: () => model.alphaRailVisible,
        onPanResponderGrant: (event) => {
          lastJumpLetterRef.current = null
          model.handleAlphaRailInteractionStart()
          setIsRailDragging(true)
          activateLetterAtY(event.nativeEvent.locationY)
        },
        onPanResponderMove: (event) => {
          activateLetterAtY(event.nativeEvent.locationY)
        },
        onPanResponderRelease: releaseRail,
        onPanResponderTerminate: releaseRail,
      }),
    [activateLetterAtY, model, releaseRail]
  )

  useEffect(() => {
    if (isRailDragging) return

    if (
      !model.alphaRailVisible ||
      model.alphaRailFocusedIndex === null ||
      !model.alphaRailFocusedLetter
    ) {
      hideHud()
      return
    }

    activeIndexRef.current = model.alphaRailFocusedIndex
    setActiveLetter(model.alphaRailFocusedLetter)
    showHudAtIndex(model.alphaRailFocusedIndex)
  }, [
    hideHud,
    isRailDragging,
    model.alphaRailFocusedIndex,
    model.alphaRailFocusedLetter,
    model.alphaRailVisible,
    showHudAtIndex,
  ])

  if (!model.shouldShowAlphaRail) return null

  return (
    <Animated.View
      accessibilityElementsHidden={!model.alphaRailVisible}
      importantForAccessibility={
        model.alphaRailVisible ? 'auto' : 'no-hide-descendants'
      }
      pointerEvents={model.alphaRailVisible ? 'box-none' : 'none'}
      style={[
        styles.wrapper,
        {
          bottom: Math.max(24, model.insets.bottom + 24),
          opacity,
          top: model.alphaRailTop,
          transform: [{ translateX }],
        },
      ]}
    >
      <Animated.View
        {...panResponder.panHandlers}
        onLayout={(event) => {
          setRailHeight(event.nativeEvent.layout.height)
        }}
        style={styles.touchTarget}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.focusHud,
            {
              backgroundColor: surfaceColor,
              borderColor: accentColor,
              borderRadius: Math.min(18, model.controlRadius),
              opacity: hudOpacity,
              shadowColor,
              transform: [
                { translateY: hudTranslateY },
                { scale: hudScale },
              ],
            },
          ]}
        >
          <Text
            style={[
              styles.focusLetter,
              {
                color: accentColor,
              },
            ]}
          >
            {activeLetter ?? ''}
          </Text>
        </Animated.View>

        <View
          pointerEvents="none"
          style={[
            styles.rail,
            {
              backgroundColor: surfaceColor,
              borderColor,
              borderRadius: model.controlRadius,
              shadowColor,
            },
          ]}
        >
          {model.alphaRailLetters.map((letter) => {
            const isAvailable = model.availableAlphaLetters.has(letter)
            const isActive = activeLetter === letter
            const letterColor =
              isActive && isAvailable
                ? accentColor
                : isAvailable
                  ? textColor
                  : mutedColor
            const letterOpacity = isActive && isAvailable ? 1 : isAvailable ? 0.7 : 0.26

            return (
              <View
                key={letter}
                accessible={isAvailable}
                accessibilityElementsHidden={!isAvailable}
                accessibilityHint="Jumps to the first visible client in this group."
                accessibilityLabel={`Jump to clients starting with ${
                  letter === '#' ? 'number or symbol' : letter
                }`}
                accessibilityRole="button"
                importantForAccessibility={isAvailable ? 'auto' : 'no-hide-descendants'}
                onAccessibilityTap={
                  isAvailable ? () => model.jumpToLetter(letter) : undefined
                }
                style={styles.letterCell}
              >
                <Text
                  style={[
                    styles.letter,
                    {
                      color: letterColor,
                      opacity: letterOpacity,
                    },
                  ]}
                >
                  {letter}
                </Text>
              </View>
            )
          })}
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  focusHud: {
    alignItems: 'center',
    borderWidth: 1,
    elevation: 8,
    height: HUD_HEIGHT,
    justifyContent: 'center',
    left: -52,
    position: 'absolute',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    top: 0,
    width: HUD_WIDTH,
    zIndex: 2,
  },
  focusLetter: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
  },
  letter: {
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 13,
    textAlign: 'center',
  },
  letterCell: {
    alignItems: 'center',
    height: LETTER_CELL_HEIGHT,
    justifyContent: 'center',
    width: 36,
  },
  rail: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 6,
    height: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
    paddingVertical: RAIL_VERTICAL_PADDING,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    width: 36,
  },
  touchTarget: {
    alignItems: 'center',
    height: '86%',
    justifyContent: 'center',
    maxHeight: 500,
    minHeight: 370,
    width: RAIL_TOUCH_WIDTH,
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'absolute',
    right: 0,
    width: RAIL_TOUCH_WIDTH,
    zIndex: 20,
  },
})
