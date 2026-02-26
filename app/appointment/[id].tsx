import { useEffect, useRef, useState } from 'react'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { CalendarDays, ChevronLeft, ChevronRight, UserRound, X } from '@tamagui/lucide-icons'
import { Animated, Easing, Image, Modal, Pressable, ScrollView as RNScrollView } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useAppointmentHistory, useClients } from 'components/data/queries'
import { formatDateByStyle } from 'components/utils/date'
import { SectionDivider } from 'components/ui/controls'
import { useStudioStore } from 'components/state/studioStore'

const cardBorder = {
  bg: '$gray1',
  borderWidth: 1,
  borderColor: '$gray3',
  shadowColor: 'rgba(15,23,42,0.08)',
  shadowRadius: 18,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
} as const

const getServiceLabel = (serviceType: string, notes: string) => {
  const normalizedService = (serviceType || '').trim()
  if (normalizedService && normalizedService.toLowerCase() !== 'service') {
    return normalizedService
  }
  const trimmed = (notes || '').trim()
  if (!trimmed) return normalizedService || 'Service'
  const firstLine = trimmed.split('\n')[0].trim()
  if (!firstLine) return normalizedService || 'Service'
  const colonIndex = firstLine.indexOf(':')
  if (colonIndex > 0) return firstLine.slice(0, colonIndex).trim()
  return firstLine
}

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const { data: clients = [] } = useClients()
  const appSettings = useStudioStore((state) => state.appSettings)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [showPreviewControls, setShowPreviewControls] = useState(true)
  const [previewWidth, setPreviewWidth] = useState(0)
  const previewScrollRef = useRef<RNScrollView | null>(null)
  const controlsOpacity = useRef(new Animated.Value(1)).current

  const appointment = appointmentHistory.find((item) => item.id === id)
  if (!appointment) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <Text fontSize={13} color="$gray8">
          Appointment not found.
        </Text>
      </YStack>
    )
  }

  const client =
    clients.find((item) => item.id === appointment.clientId) ?? clients[0]
  const images = appointment.images ?? []
  const canGoPrev = previewIndex !== null && previewIndex > 0
  const canGoNext = previewIndex !== null && previewIndex < images.length - 1

  const scrollToIndex = (index: number, animated: boolean) => {
    if (!previewWidth) return
    previewScrollRef.current?.scrollTo({
      x: index * previewWidth,
      animated,
    })
  }

  useEffect(() => {
    if (previewIndex === null || previewWidth === 0) return
    scrollToIndex(previewIndex, false)
  }, [previewIndex, previewWidth])

  useEffect(() => {
    if (previewIndex !== null) {
      setShowPreviewControls(true)
    }
  }, [previewIndex])

  useEffect(() => {
    Animated.timing(controlsOpacity, {
      toValue: showPreviewControls ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()
  }, [controlsOpacity, showPreviewControls])

  return (
    <YStack flex={1} bg="$background" position="relative">
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href={`/appointment/${appointment.id}/edit`} asChild>
              <XStack
                px="$3"
                py="$1.5"
                items="center"
                justify="center"
                pressStyle={{ opacity: 0.7 }}
              >
                <Text fontSize={13} color="$accent" fontWeight="600">
                  Edit
                </Text>
              </XStack>
            </Link>
          ),
        }}
      />
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={{ pb: "$10" }}>
        <YStack px="$5" pt="$6" gap="$4">
          <YStack gap="$2">
            <Text fontSize={20} fontWeight="700">
              {getServiceLabel(appointment.services, appointment.notes)}
            </Text>
            <XStack items="center" gap="$2">
              <CalendarDays size={14} color="$gray8" />
              <Text fontSize={12} color="$gray8">
                {formatDateByStyle(appointment.date, appSettings.dateDisplayFormat, {
                  todayLabel: true,
                  includeWeekday: appSettings.dateLongIncludeWeekday,
                })}
              </Text>
            </XStack>
          </YStack>

          <SectionDivider />

          <YStack {...cardBorder} rounded="$5" p="$4" gap="$3">
            <XStack items="center" justify="space-between">
              <Text fontSize={12} color="$gray8">
                Service
              </Text>
              <Text fontSize={12}>
                {getServiceLabel(appointment.services, appointment.notes)}
              </Text>
            </XStack>
            <XStack items="center" justify="space-between">
              <Text fontSize={12} color="$gray8">
                Price
              </Text>
              <Text fontSize={12}>${appointment.price}</Text>
            </XStack>
            <XStack items="center" justify="space-between">
              <Text fontSize={12} color="$gray8">
                Client
              </Text>
              <Text fontSize={12}>{client?.name ?? 'Client'}</Text>
            </XStack>
          </YStack>

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Formula / Notes
            </Text>
            <YStack {...cardBorder} rounded="$5" p="$4">
              <Text fontSize={12} color="$gray8">
                {appointment.notes || 'No notes recorded.'}
              </Text>
            </YStack>
          </YStack>

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Photos
            </Text>
            <YStack {...cardBorder} rounded="$5" p="$4">
              {images.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2">
                    {images.map((uri, index) => (
                      <YStack
                        key={`${uri}-${index}`}
                        width={72}
                        height={72}
                        rounded="$4"
                        overflow="hidden"
                        onPress={() => setPreviewIndex(index)}
                        cursor="pointer"
                        pressStyle={{ opacity: 0.85 }}
                      >
                        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                      </YStack>
                    ))}
                  </XStack>
                </ScrollView>
              ) : (
                <Text fontSize={12} color="$gray8">
                  No photos added yet.
                </Text>
              )}
            </YStack>
          </YStack>

          <Link href={`/client/${appointment.clientId}`} asChild>
            <XStack
              {...cardBorder}
              rounded="$5"
              p="$4"
              items="center"
              gap="$2"
              justify="center"
            >
              <UserRound size={16} color="$accent" />
              <Text fontSize={13} color="$accent">
                View Client
              </Text>
            </XStack>
          </Link>
        </YStack>
      </ScrollView>
      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewIndex(null)}
      >
        {/* Full-screen gallery preview with swipe + optional nav controls. */}
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onPress={() => setPreviewIndex(null)}
        >
          <Pressable
            onPress={(event) => {
              event?.stopPropagation?.()
              setShowPreviewControls((current) => !current)
            }}
            style={{ width: '100%', maxWidth: 420, height: '70%' }}
            onLayout={(event) => setPreviewWidth(event.nativeEvent.layout.width)}
          >
            {previewIndex !== null ? (
              <RNScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ref={previewScrollRef}
                onMomentumScrollEnd={(event) => {
                  if (!previewWidth) return
                  const nextIndex = Math.round(
                    event.nativeEvent.contentOffset.x / previewWidth
                  )
                  setPreviewIndex(nextIndex)
                }}
              >
                {images.map((uri, index) => (
                  <YStack
                    key={`${uri}-preview-${index}`}
                    width={previewWidth || 1}
                    height="100%"
                    items="center"
                    justify="center"
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  </YStack>
                ))}
              </RNScrollView>
            ) : null}
            {previewIndex !== null && images.length > 1 ? (
              <Animated.View
                pointerEvents={showPreviewControls ? 'auto' : 'none'}
                style={{
                  opacity: controlsOpacity,
                }}
              >
                <Pressable
                  onPress={() => {
                    if (!canGoPrev) return
                    const nextIndex = Math.max(0, (previewIndex ?? 0) - 1)
                    setPreviewIndex(nextIndex)
                    scrollToIndex(nextIndex, true)
                  }}
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
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    opacity: canGoPrev ? 1 : 0.3,
                  }}
                >
                  <ChevronLeft size={20} color="white" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!canGoNext) return
                    const nextIndex = Math.min(images.length - 1, (previewIndex ?? 0) + 1)
                    setPreviewIndex(nextIndex)
                    scrollToIndex(nextIndex, true)
                  }}
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
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    opacity: canGoNext ? 1 : 0.3,
                  }}
                >
                  <ChevronRight size={20} color="white" />
                </Pressable>
              </Animated.View>
            ) : null}
          </Pressable>
          <Pressable
            onPress={() => setPreviewIndex(null)}
            style={{
              position: 'absolute',
              top: 48,
              right: 24,
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            <X size={16} color="white" />
          </Pressable>
        </Pressable>
      </Modal>
    </YStack>
  )
}
