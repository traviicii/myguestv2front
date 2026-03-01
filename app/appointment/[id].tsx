import {
  useEffect,
  useRef,
  useState } from 'react'
import { Link,
  useLocalSearchParams,
  useRouter } from 'expo-router'
import { CalendarDays,
  ChevronLeft,
  ChevronRight,
  UserRound,
  X } from '@tamagui/lucide-icons'
import { Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView as RNScrollView } from 'react-native'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useThemePrefs } from 'components/ThemePrefs'
import { useAppointmentHistory,
  useClients } from 'components/data/queries'
import { FALLBACK_COLORS } from 'components/utils/color'
import { formatDateByStyle } from 'components/utils/date'
import { getServiceLabel } from 'components/utils/services'
import { SecondaryButton,
  SectionDivider,
  SurfaceCard,
  cardSurfaceProps,
} from 'components/ui/controls'
import { useStudioStore } from 'components/state/studioStore'

export default function AppointmentDetailScreen() {
  const { aesthetic } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const cardRadius = isCyberpunk ? 0 : isGlass ? 24 : 14
  const thumbRadius = isCyberpunk ? 0 : isGlass ? 14 : 8
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const appointmentId = typeof id === 'string' ? id : ''
  const { data: appointmentHistory = [], isLoading: historyLoading } =
    useAppointmentHistory()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const appSettings = useStudioStore((state) => state.appSettings)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [showPreviewControls, setShowPreviewControls] = useState(true)
  const [previewWidth, setPreviewWidth] = useState(0)
  const previewScrollRef = useRef<RNScrollView | null>(null)
  const controlsOpacity = useRef(new Animated.Value(1)).current
  const topInset = Math.max(insets.top + 8, 16)
  const isBootstrapping = (historyLoading || clientsLoading) && !appointmentHistory.length
  const GlassCard = ({
    children,
    ...props
  }: React.ComponentProps<typeof YStack>) =>
    isGlass ? (
      <SurfaceCard mode="alwaysCard" tone="secondary" gap="$0" {...props}>
        {children}
      </SurfaceCard>
    ) : (
      <YStack {...cardSurfaceProps} {...props}>
        {children}
      </YStack>
    )

  const appointment = appointmentHistory.find((item) => item.id === id)
  const client = clients.find((item) => item.id === appointment?.clientId)
  const images = appointment?.images ?? []
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
      <AmbientBackdrop />
      <XStack
        px="$5"
        pt={topInset}
        pb="$2"
        items="center"
        justify="space-between"
      >
        <SecondaryButton
          size="$2"
          height={36}
          width={38}
          px="$2"
          icon={<ChevronLeft size={16} />}
          onPress={() => router.back()}
        />
        {appointmentId ? (
          <SecondaryButton
            size="$2"
            height={36}
            width={72}
            px="$3"
            onPress={() => router.push(`/appointment/${appointmentId}/edit`)}
          >
            <Text
              fontSize={12}
              lineHeight={14}
              fontWeight="700"
              letterSpacing={isCyberpunk ? 0.8 : 0}
              textTransform={isCyberpunk ? 'uppercase' : undefined}
              style={isCyberpunk ? ({ fontFamily: 'SpaceMono' } as any) : undefined}
              color="$buttonSecondaryFg"
            >
              Edit
            </Text>
          </SecondaryButton>
        ) : (
          <YStack width={72} />
        )}
      </XStack>
      {isBootstrapping ? (
        <YStack flex={1} items="center" justify="center" bg="$background">
          <Text fontSize={13} color="$textSecondary">
            Loading appointment...
          </Text>
        </YStack>
      ) : !appointment ? (
        <YStack flex={1} items="center" justify="center" bg="$background">
          <Text fontSize={13} color="$textSecondary">
            Appointment not found.
          </Text>
        </YStack>
      ) : (
        <>
      <ScrollView contentContainerStyle={{ pb: "$10" }}>
        <YStack px="$5" pt="$3" gap="$4">
          <YStack gap="$2">
            <Text fontSize={20} fontWeight="700">
              {getServiceLabel(appointment.services, appointment.notes)}
            </Text>
            <XStack items="center" gap="$2">
              <CalendarDays size={14} color="$textSecondary" />
              <Text fontSize={12} color="$textSecondary">
              {formatDateByStyle(appointment.date, appSettings.dateDisplayFormat, {
                todayLabel: true,
                includeWeekday: appSettings.dateLongIncludeWeekday,
              })}
              </Text>
            </XStack>
          </YStack>

          <SectionDivider />

          <GlassCard rounded={cardRadius} p="$4" gap="$3">
            <XStack items="center" justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Service
              </Text>
              <Text fontSize={12}>
                {getServiceLabel(appointment.services, appointment.notes)}
              </Text>
            </XStack>
            <XStack items="center" justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Price
              </Text>
              <Text fontSize={12}>${appointment.price}</Text>
            </XStack>
            <XStack items="center" justify="space-between">
              <Text fontSize={12} color="$textSecondary">
                Client
              </Text>
              <Text fontSize={12}>{client?.name ?? 'Client'}</Text>
            </XStack>
          </GlassCard>

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Formula / Notes
            </Text>
            <GlassCard rounded={cardRadius} p="$4">
              <Text fontSize={12} color="$textSecondary">
                {appointment.notes || 'No notes recorded.'}
              </Text>
            </GlassCard>
          </YStack>

          <YStack gap="$3">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Photos
            </Text>
            <GlassCard rounded={cardRadius} p="$4">
              {images.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2">
                    {images.map((uri, index) => (
                      <YStack
                        key={`${uri}-${index}`}
                        width={72}
                        height={72}
                        rounded={thumbRadius}
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
                <Text fontSize={12} color="$textSecondary">
                  No photos added yet.
                </Text>
              )}
            </GlassCard>
          </YStack>

          <Link href={`/client/${appointment.clientId}`} asChild>
            <GlassCard
              rounded={cardRadius}
              p="$4"
            >
              <XStack items="center" gap="$2" justify="center">
                <UserRound size={16} color="$accent" />
                <Text fontSize={13} color="$accent">
                  View Client
                </Text>
              </XStack>
            </GlassCard>
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
            backgroundColor: FALLBACK_COLORS.overlayStrong,
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
                    backgroundColor: FALLBACK_COLORS.overlayDim,
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
                    backgroundColor: FALLBACK_COLORS.overlayDim,
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
              backgroundColor: FALLBACK_COLORS.overlayMedium,
            }}
          >
            <X size={16} color="white" />
          </Pressable>
        </Pressable>
      </Modal>
        </>
      )}
    </YStack>
  )
}
