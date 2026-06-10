import { useCallback, useEffect, useState, type RefObject } from 'react'
import {
  Animated as RNAnimated,
  Image,
  Modal,
  Pressable,
  ScrollView as RNScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ChevronLeft, ChevronRight, X } from '@tamagui/lucide-icons'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Reanimated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { FALLBACK_COLORS } from 'components/utils/color'

const MAX_ZOOM_SCALE = 4
const DOUBLE_TAP_ZOOM_SCALE = 2.35
const DOUBLE_TAP_TIMING = {
  duration: 165,
  easing: Easing.out(Easing.cubic),
}
const TAP_MAX_DISTANCE = 14
const TAP_MAX_DURATION = 180
const DOUBLE_TAP_MAX_DELAY = 220
const ZOOMED_THRESHOLD = 1.02
const AnimatedImage = Reanimated.createAnimatedComponent(Image)

const clamp = (value: number, min: number, max: number) => {
  'worklet'
  return Math.min(max, Math.max(min, value))
}

const clampTranslation = (value: number, scale: number, size: number) => {
  'worklet'
  const limit = Math.max(0, (size * (scale - 1)) / 2)
  return clamp(value, -limit, limit)
}

function logGalleryImageEvent(
  status: 'loaded' | 'failed',
  uri: string,
  detail?: string
) {
  if (!__DEV__) return
  const preview = uri.length > 140 ? `${uri.slice(0, 140)}...` : uri
  const message = `[appointment-gallery-image:${status}] ${preview}`
  if (status === 'failed') {
    console.warn(message, detail ?? '')
    return
  }
  console.log(message)
}

type AppointmentGalleryPreviewModalProps = {
  canGoNext: boolean
  canGoPrev: boolean
  controlsOpacity: RNAnimated.Value
  images: string[]
  onClose: () => void
  onGoNext: () => void
  onGoPrev: () => void
  onLayoutWidth: (width: number) => void
  onMomentumScrollEnd: (offsetX: number) => void
  onToggleControls: () => void
  previewIndex: number | null
  previewScrollRef: RefObject<RNScrollView | null>
  previewWidth: number
  showPreviewControls: boolean
}

type ZoomableGalleryImageProps = {
  active: boolean
  pageHeight: number
  pageWidth: number
  uri: string
  zoomed: boolean
  onToggleControls: () => void
  onZoomChange: (zoomed: boolean) => void
}

function ZoomableGalleryImage({
  active,
  pageHeight,
  pageWidth,
  uri,
  zoomed,
  onToggleControls,
  onZoomChange,
}: ZoomableGalleryImageProps) {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  const updateZoomState = useCallback(
    (zoomed: boolean) => {
      onZoomChange(zoomed)
    },
    [onZoomChange]
  )

  const resetZoom = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 180 })
    savedScale.value = 1
    translateX.value = withSpring(0, { damping: 18, stiffness: 180 })
    translateY.value = withSpring(0, { damping: 18, stiffness: 180 })
    savedTranslateX.value = 0
    savedTranslateY.value = 0
    updateZoomState(false)
  }, [
    savedScale,
    savedTranslateX,
    savedTranslateY,
    scale,
    translateX,
    translateY,
    updateZoomState,
  ])

  useEffect(() => {
    if (!active) {
      resetZoom()
    }
  }, [active, resetZoom])

  useEffect(() => {
    resetZoom()
  }, [resetZoom, uri])

  const pinchGesture = Gesture.Pinch()
    .enabled(active)
    .onBegin(() => {
      savedScale.value = scale.value
      runOnJS(updateZoomState)(true)
    })
    .onUpdate((event) => {
      const nextScale = clamp(savedScale.value * event.scale, 1, MAX_ZOOM_SCALE)
      scale.value = nextScale
      translateX.value = clampTranslation(translateX.value, nextScale, pageWidth || 1)
      translateY.value = clampTranslation(translateY.value, nextScale, pageHeight || 1)
    })
    .onEnd(() => {
      if (scale.value <= ZOOMED_THRESHOLD) {
        scale.value = withSpring(1, { damping: 18, stiffness: 180 })
        savedScale.value = 1
        translateX.value = withSpring(0, { damping: 18, stiffness: 180 })
        translateY.value = withSpring(0, { damping: 18, stiffness: 180 })
        savedTranslateX.value = 0
        savedTranslateY.value = 0
        runOnJS(updateZoomState)(false)
        return
      }

      translateX.value = withSpring(
        clampTranslation(translateX.value, scale.value, pageWidth || 1),
        { damping: 18, stiffness: 180 }
      )
      translateY.value = withSpring(
        clampTranslation(translateY.value, scale.value, pageHeight || 1),
        { damping: 18, stiffness: 180 }
      )
      savedScale.value = scale.value
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
      runOnJS(updateZoomState)(true)
    })

  const panGesture = Gesture.Pan()
    .enabled(active && zoomed)
    .onBegin(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((event) => {
      if (scale.value <= ZOOMED_THRESHOLD) return
      translateX.value = clampTranslation(
        savedTranslateX.value + event.translationX,
        scale.value,
        pageWidth || 1
      )
      translateY.value = clampTranslation(
        savedTranslateY.value + event.translationY,
        scale.value,
        pageHeight || 1
      )
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })

  const doubleTapGesture = Gesture.Tap()
    .enabled(active)
    .numberOfTaps(2)
    .maxDelay(DOUBLE_TAP_MAX_DELAY)
    .maxDuration(TAP_MAX_DURATION)
    .maxDistance(TAP_MAX_DISTANCE)
    .onEnd((event) => {
      if (scale.value > ZOOMED_THRESHOLD) {
        scale.value = withTiming(1, DOUBLE_TAP_TIMING, (finished) => {
          if (finished) {
            runOnJS(updateZoomState)(false)
          }
        })
        savedScale.value = 1
        translateX.value = withTiming(0, DOUBLE_TAP_TIMING)
        translateY.value = withTiming(0, DOUBLE_TAP_TIMING)
        savedTranslateX.value = 0
        savedTranslateY.value = 0
        return
      }

      const nextScale = DOUBLE_TAP_ZOOM_SCALE
      const width = pageWidth || 1
      const height = pageHeight || 1
      const nextTranslateX = clampTranslation(
        (width / 2 - event.x) * (nextScale - 1),
        nextScale,
        width
      )
      const nextTranslateY = clampTranslation(
        (height / 2 - event.y) * (nextScale - 1),
        nextScale,
        height
      )

      scale.value = withTiming(nextScale, DOUBLE_TAP_TIMING, (finished) => {
        if (finished) {
          runOnJS(updateZoomState)(true)
        }
      })
      savedScale.value = nextScale
      translateX.value = withTiming(nextTranslateX, DOUBLE_TAP_TIMING)
      translateY.value = withTiming(nextTranslateY, DOUBLE_TAP_TIMING)
      savedTranslateX.value = nextTranslateX
      savedTranslateY.value = nextTranslateY
    })

  const singleTapGesture = Gesture.Tap()
    .enabled(active)
    .numberOfTaps(1)
    .maxDuration(TAP_MAX_DURATION)
    .maxDistance(TAP_MAX_DISTANCE)
    .onEnd(() => {
      runOnJS(onToggleControls)()
    })

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    Gesture.Exclusive(doubleTapGesture, singleTapGesture)
  )

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return (
    <GestureDetector gesture={composedGesture}>
      <Reanimated.View style={styles.zoomStage}>
        <AnimatedImage
          source={{ uri }}
          style={[styles.image, imageStyle]}
          resizeMode="contain"
          onLoad={() => logGalleryImageEvent('loaded', uri)}
          onError={(event) =>
            logGalleryImageEvent('failed', uri, event.nativeEvent.error)
          }
        />
      </Reanimated.View>
    </GestureDetector>
  )
}

export function AppointmentGalleryPreviewModal({
  canGoNext,
  canGoPrev,
  controlsOpacity,
  images,
  onClose,
  onGoNext,
  onGoPrev,
  onLayoutWidth,
  onMomentumScrollEnd,
  onToggleControls,
  previewIndex,
  previewScrollRef,
  previewWidth,
  showPreviewControls,
}: AppointmentGalleryPreviewModalProps) {
  const [stageHeight, setStageHeight] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    setIsZoomed(false)
  }, [previewIndex])

  return (
    <Modal
      visible={previewIndex !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close photo preview"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          style={styles.stage}
          onLayout={(event) => {
            onLayoutWidth(event.nativeEvent.layout.width)
            setStageHeight(event.nativeEvent.layout.height)
          }}
        >
          {previewIndex !== null ? (
            <RNScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={previewScrollRef}
              bounces={false}
              decelerationRate="fast"
              scrollEnabled={!isZoomed}
              onMomentumScrollEnd={(event) => {
                onMomentumScrollEnd(event.nativeEvent.contentOffset.x)
              }}
            >
              {images.map((uri, index) => (
                <View
                  key={`${uri}-preview-${index}`}
                  style={[styles.page, { width: previewWidth || 1 }]}
                >
                  <ZoomableGalleryImage
                    active={previewIndex === index}
                    pageHeight={stageHeight}
                    pageWidth={previewWidth || 1}
                    uri={uri}
                    zoomed={previewIndex === index && isZoomed}
                    onToggleControls={onToggleControls}
                    onZoomChange={setIsZoomed}
                  />
                </View>
              ))}
            </RNScrollView>
          ) : null}
          {previewIndex !== null && images.length > 1 ? (
            <RNAnimated.View
              pointerEvents={showPreviewControls ? 'auto' : 'none'}
              style={{ opacity: controlsOpacity }}
            >
              <Pressable
                onPress={onGoPrev}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  marginTop: -22,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: FALLBACK_COLORS.overlayDim,
                  opacity: canGoPrev ? 1 : 0.3,
                }}
              >
                <ChevronLeft size={20} color="white" />
              </Pressable>
              <Pressable
                onPress={onGoNext}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  marginTop: -22,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: FALLBACK_COLORS.overlayDim,
                  opacity: canGoNext ? 1 : 0.3,
                }}
              >
                <ChevronRight size={20} color="white" />
              </Pressable>
            </RNAnimated.View>
          ) : null}
        </View>
        {previewIndex !== null && images.length > 1 ? (
          <View style={styles.counterPill} pointerEvents="none">
            <Text style={styles.counterText}>
              {previewIndex + 1} / {images.length}
            </Text>
          </View>
        ) : null}
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
        >
          <X size={16} color="white" />
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: FALLBACK_COLORS.overlayStrong,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stage: {
    height: '70%',
    maxWidth: 420,
    width: '100%',
  },
  page: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  zoomStage: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: FALLBACK_COLORS.overlayMedium,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    top: 48,
    width: 36,
  },
  counterPill: {
    alignItems: 'center',
    backgroundColor: FALLBACK_COLORS.overlayMedium,
    borderRadius: 999,
    bottom: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
})
