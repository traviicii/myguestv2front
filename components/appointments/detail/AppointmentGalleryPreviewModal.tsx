import type { RefObject } from 'react'
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView as RNScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ChevronLeft, ChevronRight, X } from '@tamagui/lucide-icons'

import { FALLBACK_COLORS } from 'components/utils/color'

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
  controlsOpacity: Animated.Value
  images: string[]
  onClose: () => void
  onGoNext: () => void
  onGoPrev: () => void
  onLayoutWidth: (width: number) => void
  onMomentumScrollEnd: (offsetX: number) => void
  previewIndex: number | null
  previewScrollRef: RefObject<RNScrollView | null>
  previewWidth: number
  showPreviewControls: boolean
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
  previewIndex,
  previewScrollRef,
  previewWidth,
  showPreviewControls,
}: AppointmentGalleryPreviewModalProps) {
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
          onLayout={(event) => onLayoutWidth(event.nativeEvent.layout.width)}
        >
          {previewIndex !== null ? (
            <RNScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={previewScrollRef}
              bounces={false}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                onMomentumScrollEnd(event.nativeEvent.contentOffset.x)
              }}
            >
              {images.map((uri, index) => (
                <View
                  key={`${uri}-preview-${index}`}
                  style={[styles.page, { width: previewWidth || 1 }]}
                >
                  <Image
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoad={() => logGalleryImageEvent('loaded', uri)}
                    onError={(event) =>
                      logGalleryImageEvent('failed', uri, event.nativeEvent.error)
                    }
                  />
                </View>
              ))}
            </RNScrollView>
          ) : null}
          {previewIndex !== null && images.length > 1 ? (
            <Animated.View
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
            </Animated.View>
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
