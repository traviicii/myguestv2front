import {
  useEffect,
  useMemo,
  useRef,
  useState } from 'react'
import { useLocalSearchParams,
  useRouter } from 'expo-router'
import { Camera, Check, ChevronDown, UploadCloud, X } from '@tamagui/lucide-icons'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { Alert,
  Keyboard,
  Image,
  Modal,
  Platform,
  Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import Animated from 'react-native-reanimated'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useThemePrefs } from 'components/ThemePrefs'
import { useAppointmentHistory,
  useClients,
  useServices,
  useUpdateAppointmentLog } from 'components/data/queries'
import { formatDateMMDDYYYY } from 'components/utils/date'
import { FALLBACK_COLORS } from 'components/utils/color'
import { buildFormulaImageInputs } from 'components/utils/formulaImages'
import { normalizeServiceName } from 'components/utils/services'
import { ErrorPulseBorder,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  TextAreaField,
  TextField,
} from 'components/ui/controls'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { useExpandablePanel } from 'components/ui/useExpandablePanel'

const parsePrice = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

const formatPriceFromCents = (value: number | null) => {
  if (value === null) return ''
  return (value / 100).toFixed(2).replace(/\.00$/, '')
}

export default function EditAppointmentScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const isModern = aesthetic === 'modern'
  const cardTone = isGlass ? 'secondary' : 'default'
  const cardMode = isModern ? 'section' : 'alwaysCard'
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: appointmentHistory = [], isLoading: historyLoading } = useAppointmentHistory()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: serviceCatalog = [] } = useServices('all')
  const updateAppointmentLog = useUpdateAppointmentLog()
  const scrollRef = useRef<any>(null)
  const initialServiceIdsRef = useRef<number[]>([])
  const hasInitializedServicesRef = useRef(false)
  const requiredY = useRef<{ date?: number }>({})
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [showServicePicker, setShowServicePicker] = useState(false)

  const appointment = appointmentHistory.find((item) => item.id === id)

  const client = clients.find((item) => item.id === appointment?.clientId)
  const isBootstrapping = (historyLoading || clientsLoading) && !appointmentHistory.length

  const initialForm = useMemo(
    () => ({
      date: appointment ? formatDateMMDDYYYY(appointment.date) : '',
      price: appointment ? String(appointment.price) : '',
      notes: appointment?.notes ?? '',
    }),
    [appointment]
  )

  const [form, setForm] = useState(initialForm)
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [images, setImages] = useState<string[]>(appointment?.images ?? [])
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const servicePanel = useExpandablePanel(showServicePicker, { hideDelayMs: 220 })
  const selectedServices = useMemo(
    () => serviceCatalog.filter((service) => selectedServiceIds.includes(service.id)),
    [serviceCatalog, selectedServiceIds]
  )
  const pickerServices = useMemo(
    () =>
      serviceCatalog.filter(
        (service) => service.isActive || selectedServiceIds.includes(service.id)
      ),
    [serviceCatalog, selectedServiceIds]
  )
  const selectedServiceSummary = useMemo(() => {
    if (selectedServices.length === 0) return 'Select services'
    if (selectedServices.length === 1) return selectedServices[0].name
    return `${selectedServices[0].name} +${selectedServices.length - 1}`
  }, [selectedServices])
  const selectedServiceSet = useMemo(
    () => new Set(selectedServiceIds),
    [selectedServiceIds]
  )
  const suggestedPriceCents = useMemo(() => {
    const prices = selectedServices
      .map((service) => service.defaultPriceCents)
      .filter((value): value is number => typeof value === 'number')
    if (!prices.length) return null
    return prices.reduce((sum, value) => sum + value, 0)
  }, [selectedServices])

  useEffect(() => {
    if (!appointment || hasInitializedServicesRef.current) return

    const appointmentServiceIds = appointment.serviceIds ?? []
    if (appointmentServiceIds.length > 0 && serviceCatalog.length === 0) return

    const validIds = appointmentServiceIds.filter((serviceId) =>
      serviceCatalog.some((service) => service.id === serviceId)
    )

    let initialIds = validIds
    if (initialIds.length === 0 && appointment.services) {
      const normalized = normalizeServiceName(appointment.services).toLowerCase()
      const match = serviceCatalog.find((service) => service.normalizedName === normalized)
      if (match) {
        initialIds = [match.id]
      }
    }

    initialServiceIdsRef.current = initialIds
    setSelectedServiceIds(initialIds)
    hasInitializedServicesRef.current = true
  }, [appointment, serviceCatalog])

  const isDirty = useMemo(() => {
    const selectedSnapshot = selectedServiceIds.join('|')
    const initialSnapshot = initialServiceIdsRef.current.join('|')
    return (
      form.date !== initialForm.date ||
      form.price !== initialForm.price ||
      form.notes !== initialForm.notes ||
      selectedSnapshot !== initialSnapshot ||
      images.join('|') !== (appointment?.images ?? []).join('|')
    )
  }, [form, images, initialForm, appointment?.images, selectedServiceIds])

  const hasRequired = useMemo(() => {
    return Boolean(form.date.trim())
  }, [form.date])

  const canSave = isDirty && !updateAppointmentLog.isPending
  const showDateError = attemptedSave && !form.date.trim()
  const keyboardAccessoryId = 'appointment-edit-keyboard-dismiss'
  const keyboardDismissMode = Platform.OS === 'ios' ? 'interactive' : 'on-drag'

  const toggleServiceSelection = (serviceId: number) => {
    setSelectedServiceIds((current) => {
      if (current.includes(serviceId)) {
        return current.filter((id) => id !== serviceId)
      }
      return [...current, serviceId]
    })
  }

  const handleSave = async () => {
    setAttemptedSave(true)
    if (!hasRequired || !isDirty) {
      if (!hasRequired && typeof requiredY.current.date === 'number') {
        scrollRef.current?.scrollTo({
          y: Math.max(0, requiredY.current.date - 12),
          animated: true,
        })
        setTimeout(() => {
          setPulseKey((count) => count + 1)
        }, 350)
      } else if (!hasRequired) {
        setPulseKey((count) => count + 1)
      }
      return
    }

    if (!appointment) return

    try {
      const parsedPrice = parsePrice(form.price)
      const primaryService = selectedServices[0]?.name
      await updateAppointmentLog.mutateAsync({
        formulaId: appointment.id,
        serviceIds: selectedServiceIds,
        serviceType: primaryService ? normalizeServiceName(primaryService) : null,
        notes: form.notes,
        price: parsedPrice,
        date: form.date,
        images: buildFormulaImageInputs(images, appointment.imageRefs ?? []),
      })

      router.back()
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Unable to save appointment log right now. Please try again.'
      )
    }
  }

  const addImages = (uris: string[]) => {
    if (!uris.length) return
    setImages((current) => [...uris, ...current])
  }

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, idx) => idx !== index))
  }

  const setCoverImage = (index: number) => {
    setImages((current) => {
      if (index <= 0 || index >= current.length) return current
      const next = [...current]
      const [cover] = next.splice(index, 1)
      next.unshift(cover)
      return next
    })
  }

  const handleCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') return

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      })
      if (!result.canceled) {
        addImages(result.assets.map((asset) => asset.uri))
      }
    } catch (error) {
      Alert.alert('Camera unavailable', 'Camera is not available on the simulator. Use Upload instead.')
    }
  }

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      addImages(result.assets.map((asset) => asset.uri))
    }
  }

  if (isBootstrapping) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <Text fontSize={13} color="$textSecondary">
          Loading appointment...
        </Text>
      </YStack>
    )
  }

  if (!appointment) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <Text fontSize={13} color="$textSecondary">
          Appointment not found.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
      <KeyboardDismissAccessory nativeID={keyboardAccessoryId} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ pb: "$10" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={keyboardDismissMode}
        onScrollBeginDrag={() => {
          Keyboard.dismiss()
          setShowServicePicker(false)
        }}
      >
        <YStack px="$5" pt="$5" gap="$3">
          <YStack gap="$1">
            <Text fontSize={11} letterSpacing={1} color="$textMuted">
              EDIT APPOINTMENT LOG
            </Text>
            <Text fontFamily="$heading" fontSize={20} fontWeight="700" color="$color">
              {client?.name ?? 'Client'}
            </Text>
          </YStack>

          <SectionDivider />

          <SurfaceCard mode={cardMode} tone={cardTone} p="$4" gap="$2.5">
            <YStack
              gap="$2"
              onLayout={(event) => {
                requiredY.current.date = event.nativeEvent.layout.y
              }}
            >
              <Text fontSize={12} color="$textSecondary">
                Date
              </Text>
              <YStack position="relative">
                <TextField
                  placeholder="MM/DD/YYYY"
                  value={form.date}
                  inputAccessoryViewID={keyboardAccessoryId}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, date: text }))
                  }
                  borderColor={showDateError ? '$red10' : '$borderSubtle'}
                />
                <ErrorPulseBorder active={showDateError} pulseKey={pulseKey} />
              </YStack>
              {showDateError ? (
                <Text fontSize={11} color="$red10">
                  Date is required.
                </Text>
              ) : null}
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$textSecondary">
                Services
              </Text>
              <YStack position="relative">
                <XStack
                  height={44}
                  px="$3"
                  rounded="$4"
                  borderWidth={1}
                  borderColor={showServicePicker ? '$accent' : '$borderSubtle'}
                  bg="$surfaceField"
                  items="center"
                  justify="space-between"
                  onPress={() => setShowServicePicker((current) => !current)}
                >
                  <Text
                    fontSize={14}
                    color={selectedServices.length ? '$color' : '$textSecondary'}
                  >
                    {selectedServiceSummary}
                  </Text>
                  <ChevronDown size={16} color="$textSecondary" />
                </XStack>
              </YStack>
              {servicePanel.showPanel ? (
                <YStack position="relative">
                  <YStack
                    position="absolute"
                    l={0}
                    r={0}
                    t={0}
                    opacity={0}
                    pointerEvents="none"
                    onLayout={(event) => {
                      servicePanel.setMeasured(event.nativeEvent.layout.height)
                    }}
                  >
                    {isGlass ? (
                      <SurfaceCard mode={cardMode} tone={cardTone} p="$2" gap="$0">
                        <YStack gap="$1">
                          <XStack
                            px="$3"
                            py="$2.5"
                            rounded="$3"
                            items="center"
                            justify="space-between"
                            bg={!selectedServiceIds.length ? '$accentMuted' : '$background'}
                            borderWidth={1}
                            borderColor={
                              !selectedServiceIds.length ? '$accentSoft' : '$borderSubtle'
                            }
                            onPress={() => {
                              setSelectedServiceIds([])
                            }}
                          >
                            <Text
                              fontSize={13}
                              color={!selectedServiceIds.length ? '$accent' : '$textSecondary'}
                            >
                              Clear all
                            </Text>
                            {!selectedServiceIds.length ? (
                              <Check size={14} color="$accent" />
                            ) : null}
                          </XStack>
                          {pickerServices.map((service) => {
                            const isActive = selectedServiceSet.has(service.id)
                            return (
                              <XStack
                                key={service.id}
                                px="$3"
                                py="$2.5"
                                rounded="$3"
                                items="center"
                                justify="space-between"
                                bg={isActive ? '$accentMuted' : '$background'}
                                borderWidth={1}
                                borderColor={isActive ? '$accentSoft' : '$borderSubtle'}
                                onPress={() => {
                                  toggleServiceSelection(service.id)
                                }}
                              >
                                <Text fontSize={13} color={isActive ? '$accent' : '$color'}>
                                  {service.name}
                                </Text>
                                {isActive ? <Check size={14} color="$accent" /> : null}
                              </XStack>
                            )
                          })}
                        </YStack>
                      </SurfaceCard>
                    ) : (
                      <YStack
                        rounded="$4"
                        borderWidth={1}
                        borderColor="$borderSubtle"
                        p="$2"
                        bg="$background"
                      >
                        <YStack gap="$1">
                          <XStack
                            px="$3"
                            py="$2.5"
                            rounded="$3"
                            items="center"
                            justify="space-between"
                            bg={!selectedServiceIds.length ? '$accentMuted' : '$background'}
                            borderWidth={1}
                            borderColor={
                              !selectedServiceIds.length ? '$accentSoft' : '$borderSubtle'
                            }
                            onPress={() => {
                              setSelectedServiceIds([])
                            }}
                          >
                            <Text
                              fontSize={13}
                              color={!selectedServiceIds.length ? '$accent' : '$textSecondary'}
                            >
                              Clear all
                            </Text>
                            {!selectedServiceIds.length ? (
                              <Check size={14} color="$accent" />
                            ) : null}
                          </XStack>
                          {pickerServices.map((service) => {
                            const isActive = selectedServiceSet.has(service.id)
                            return (
                              <XStack
                                key={service.id}
                                px="$3"
                                py="$2.5"
                                rounded="$3"
                                items="center"
                                justify="space-between"
                                bg={isActive ? '$accentMuted' : '$background'}
                                borderWidth={1}
                                borderColor={isActive ? '$accentSoft' : '$borderSubtle'}
                                onPress={() => {
                                  toggleServiceSelection(service.id)
                                }}
                              >
                                <Text fontSize={13} color={isActive ? '$accent' : '$color'}>
                                  {service.name}
                                </Text>
                                {isActive ? <Check size={14} color="$accent" /> : null}
                              </XStack>
                            )
                          })}
                        </YStack>
                      </YStack>
                    )}
                  </YStack>
                  <Animated.View style={[{ overflow: 'hidden' }, servicePanel.animatedStyle]}>
                    {isGlass ? (
                      <SurfaceCard mode={cardMode} tone={cardTone} p="$2" gap="$0">
                        <YStack gap="$1">
                          <XStack
                            px="$3"
                            py="$2.5"
                            rounded="$3"
                            items="center"
                            justify="space-between"
                            bg={!selectedServiceIds.length ? '$accentMuted' : '$background'}
                            borderWidth={1}
                            borderColor={
                              !selectedServiceIds.length ? '$accentSoft' : '$borderSubtle'
                            }
                            onPress={() => {
                              setSelectedServiceIds([])
                            }}
                          >
                            <Text
                              fontSize={13}
                              color={!selectedServiceIds.length ? '$accent' : '$textSecondary'}
                            >
                              Clear all
                            </Text>
                            {!selectedServiceIds.length ? (
                              <Check size={14} color="$accent" />
                            ) : null}
                          </XStack>
                          {pickerServices.map((service) => {
                            const isActive = selectedServiceSet.has(service.id)
                            return (
                              <XStack
                                key={service.id}
                                px="$3"
                                py="$2.5"
                                rounded="$3"
                                items="center"
                                justify="space-between"
                                bg={isActive ? '$accentMuted' : '$background'}
                                borderWidth={1}
                                borderColor={isActive ? '$accentSoft' : '$borderSubtle'}
                                onPress={() => {
                                  toggleServiceSelection(service.id)
                                }}
                              >
                                <Text fontSize={13} color={isActive ? '$accent' : '$color'}>
                                  {service.name}
                                </Text>
                                {isActive ? <Check size={14} color="$accent" /> : null}
                              </XStack>
                            )
                          })}
                        </YStack>
                      </SurfaceCard>
                    ) : (
                      <YStack
                        rounded="$4"
                        borderWidth={1}
                        borderColor="$borderSubtle"
                        p="$2"
                        bg="$background"
                        shadowColor={FALLBACK_COLORS.shadowSoft}
                        shadowRadius={14}
                        shadowOpacity={1}
                        shadowOffset={{ width: 0, height: 6 }}
                        elevation={2}
                      >
                        <YStack gap="$1">
                          <XStack
                            px="$3"
                            py="$2.5"
                            rounded="$3"
                            items="center"
                            justify="space-between"
                            bg={!selectedServiceIds.length ? '$accentMuted' : '$background'}
                            borderWidth={1}
                            borderColor={
                              !selectedServiceIds.length ? '$accentSoft' : '$borderSubtle'
                            }
                            onPress={() => {
                              setSelectedServiceIds([])
                            }}
                          >
                            <Text
                              fontSize={13}
                              color={!selectedServiceIds.length ? '$accent' : '$textSecondary'}
                            >
                              Clear all
                            </Text>
                            {!selectedServiceIds.length ? (
                              <Check size={14} color="$accent" />
                            ) : null}
                          </XStack>
                          {pickerServices.map((service) => {
                            const isActive = selectedServiceSet.has(service.id)
                            return (
                              <XStack
                                key={service.id}
                                px="$3"
                                py="$2.5"
                                rounded="$3"
                                items="center"
                                justify="space-between"
                                bg={isActive ? '$accentMuted' : '$background'}
                                borderWidth={1}
                                borderColor={isActive ? '$accentSoft' : '$borderSubtle'}
                                onPress={() => {
                                  toggleServiceSelection(service.id)
                                }}
                              >
                                <Text fontSize={13} color={isActive ? '$accent' : '$color'}>
                                  {service.name}
                                </Text>
                                {isActive ? <Check size={14} color="$accent" /> : null}
                              </XStack>
                            )
                          })}
                        </YStack>
                      </YStack>
                    )}
                  </Animated.View>
                </YStack>
              ) : null}
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$textSecondary">
                Price
              </Text>
              <TextField
                placeholder="$0.00"
                value={form.price}
                inputAccessoryViewID={keyboardAccessoryId}
                onFocus={() => setShowServicePicker(false)}
                onChangeText={(text) => setForm((prev) => ({ ...prev, price: text }))}
              />
              {suggestedPriceCents !== null ? (
                <XStack items="center" justify="space-between" gap="$2">
                  <Text fontSize={11} color="$textSecondary">
                    Suggested from services: ${formatPriceFromCents(suggestedPriceCents)}
                  </Text>
                  {form.price.trim() !== formatPriceFromCents(suggestedPriceCents) ? (
                    <SecondaryButton
                      size="$2"
                      px="$2"
                      onPress={() =>
                        setForm((prev) => ({
                          ...prev,
                          price: formatPriceFromCents(suggestedPriceCents),
                        }))
                      }
                    >
                      Apply Suggested
                    </SecondaryButton>
                  ) : null}
                </XStack>
              ) : null}
            </YStack>
            <YStack gap="$2">
              <Text fontSize={12} color="$textSecondary">
                Formula / Notes
              </Text>
              <TextAreaField
                placeholder="Color formula, technique, notes..."
                value={form.notes}
                inputAccessoryViewID={keyboardAccessoryId}
                onFocus={() => setShowServicePicker(false)}
                onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
              />
            </YStack>
          </SurfaceCard>

          <SurfaceCard mode={cardMode} tone={cardTone} p="$4" gap="$2.5">
            <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
              Photos
            </Text>
            <XStack gap="$3" flexWrap="wrap">
              <SecondaryButton
                icon={<Camera size={16} />}
                size="$4"
                onPress={() => {
                  Keyboard.dismiss()
                  setShowServicePicker(false)
                  void handleCapture()
                }}
              >
                Capture
              </SecondaryButton>
              <SecondaryButton
                icon={<UploadCloud size={16} />}
                size="$4"
                onPress={() => {
                  Keyboard.dismiss()
                  setShowServicePicker(false)
                  void handleUpload()
                }}
              >
                Upload
              </SecondaryButton>
            </XStack>
            {images.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" pt="$2">
                  {images.map((uri, index) => (
                    <YStack
                      key={`${uri}-${index}`}
                      gap="$1.5"
                      items="center"
                    >
                      <YStack
                        width={72}
                        height={72}
                        rounded="$4"
                        overflow="hidden"
                        position="relative"
                        onPress={() => setPreviewUri(uri)}
                        cursor="pointer"
                        pressStyle={{ opacity: 0.85 }}
                      >
                        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                        <XStack
                          position="absolute"
                          t={4}
                          r={4}
                          width={20}
                          height={20}
                          rounded={10}
                          items="center"
                          justify="center"
                          bg={FALLBACK_COLORS.overlayMedium}
                          onPress={(event) => {
                            event?.stopPropagation?.()
                            removeImage(index)
                          }}
                        >
                          <X size={12} color="white" />
                        </XStack>
                        {index === 0 ? (
                          <XStack
                            position="absolute"
                            l={4}
                            t={4}
                            px="$1.5"
                            py="$0.5"
                            rounded="$2"
                            bg="$accent"
                          >
                            <Text fontSize={9} color="white" fontWeight="700">
                              Cover
                            </Text>
                          </XStack>
                        ) : null}
                      </YStack>
                      {index !== 0 ? (
                        <SecondaryButton
                          size="$1"
                          height={24}
                          px="$2"
                          onPress={(event) => {
                            event?.stopPropagation?.()
                            setCoverImage(index)
                          }}
                        >
                          <Text fontSize={10} color="$buttonSecondaryFg" fontWeight="700">
                            Set Cover
                          </Text>
                        </SecondaryButton>
                      ) : null}
                    </YStack>
                  ))}
                </XStack>
              </ScrollView>
            ) : (
              <Text fontSize={11} color="$textSecondary">
                No images added yet.
              </Text>
            )}
          </SurfaceCard>

          <XStack gap="$3">
            <SecondaryButton flex={1} onPress={() => router.back()}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              flex={1}
              onPress={() => {
                Keyboard.dismiss()
                void handleSave()
              }}
              disabled={!canSave}
              opacity={canSave ? 1 : 0.5}
            >
              {updateAppointmentLog.isPending ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </XStack>
        </YStack>
      </ScrollView>
      <Modal
        visible={Boolean(previewUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: FALLBACK_COLORS.overlayStrong,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onPress={() => setPreviewUri(null)}
        >
          <Pressable
            onPress={(event) => event?.stopPropagation?.()}
            style={{ width: '100%', maxWidth: 420, height: '70%' }}
          >
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            ) : null}
          </Pressable>
          <Pressable
            onPress={() => setPreviewUri(null)}
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
    </YStack>
  )
}
