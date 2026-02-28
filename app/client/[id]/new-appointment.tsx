import {
  useMemo,
  useRef,
  useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronDown,
  UploadCloud,
  X } from '@tamagui/lucide-icons'
import { Alert,
  Image,
  Modal,
  Platform,
  Pressable } from 'react-native'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import DateTimePicker,
  { type DateTimePickerEvent,
  } from '@react-native-community/datetimepicker'
import Animated from 'react-native-reanimated'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useThemePrefs } from 'components/ThemePrefs'
import { useClients, useCreateAppointmentLog, useServices } from 'components/data/queries'
import { formatDateMMDDYYYY } from 'components/utils/date'
import { buildFormulaImageInputs } from 'components/utils/formulaImages'
import { normalizeServiceName } from 'components/utils/services'
import { ErrorPulseBorder,
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  SurfaceCard,
  TextAreaField,
  TextField,
  ThemedEyebrowText,
  ThemedHeadingText,
} from 'components/ui/controls'
import { useExpandablePanel } from 'components/ui/useExpandablePanel'

const pad = (value: number) => String(value).padStart(2, '0')

const formatDateFromPicker = (date: Date) =>
  formatDateMMDDYYYY(
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  )

const parseDateForPicker = (value: string) => {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3])
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const parsePrice = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

export default function NewAppointmentScreen() {
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [] } = useClients()
  const { data: serviceOptions = [] } = useServices('true')
  const createAppointmentLog = useCreateAppointmentLog()
  const client = clients.find((item) => item.id === id) ?? clients[0]
  const scrollRef = useRef<any>(null)
  const requiredY = useRef<{ date?: number }>({})
  const [form, setForm] = useState({
    date: '',
    price: '',
    notes: '',
  })
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [images, setImages] = useState<string[]>([])
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showServicePicker, setShowServicePicker] = useState(false)
  const datePanel = useExpandablePanel(showDatePicker, { hideDelayMs: 260 })
  const servicePanel = useExpandablePanel(showServicePicker, { hideDelayMs: 220 })
  const selectedServices = useMemo(
    () => serviceOptions.filter((service) => selectedServiceIds.includes(service.id)),
    [serviceOptions, selectedServiceIds]
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

  const isDirty = useMemo(() => {
    const hasText =
      form.date.trim() ||
      form.price.trim() ||
      form.notes.trim()
    return Boolean(hasText || selectedServiceIds.length || images.length)
  }, [form, images.length, selectedServiceIds.length])

  const hasRequired = useMemo(() => {
    return Boolean(form.date.trim())
  }, [form.date])

  const canSave = isDirty && !createAppointmentLog.isPending
  const showDateError = attemptedSave && !form.date.trim()
  const pickerDate = useMemo(
    () => parseDateForPicker(form.date) ?? new Date(),
    [form.date]
  )
  const topBar = (
    <XStack px="$5" pt={topInset} pb="$2" items="center" justify="space-between">
      <SecondaryButton
        size="$2"
        height={36}
        width={38}
        px="$2"
        icon={<ChevronLeft size={16} />}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      />
      <YStack width={38} />
    </XStack>
  )

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (!selectedDate) return
    setForm((prev) => ({ ...prev, date: formatDateFromPicker(selectedDate) }))
  }

  const handleDateFieldPress = () => {
    setShowServicePicker(false)
    if (Platform.OS === 'android') {
      setShowDatePicker(true)
      return
    }
    setShowDatePicker((current) => !current)
  }

  const handleServiceFieldPress = () => {
    setShowDatePicker(false)
    setShowServicePicker((current) => !current)
  }

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
    if (!hasRequired) {
      if (typeof requiredY.current.date === 'number') {
        scrollRef.current?.scrollTo({
          y: Math.max(0, requiredY.current.date - 12),
          animated: true,
        })
      }
      const delay = typeof requiredY.current.date === 'number' ? 350 : 0
      setTimeout(() => {
        setPulseKey((count) => count + 1)
      }, delay)
      return
    }

    if (!client) return

    try {
      const parsedPrice = parsePrice(form.price)
      const primaryService = selectedServices[0]?.name
      await createAppointmentLog.mutateAsync({
        clientId: client.id,
        serviceIds: selectedServiceIds,
        serviceType: primaryService ? normalizeServiceName(primaryService) : null,
        notes: form.notes,
        price: parsedPrice,
        date: form.date,
        images: buildFormulaImageInputs(images),
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

  if (!client) {
    return (
      <YStack flex={1} bg="$background" position="relative">
        <AmbientBackdrop />
        {topBar}
        <YStack flex={1} items="center" justify="center">
        <Text fontSize={13} color="$textSecondary">
          Client not found.
        </Text>
        </YStack>
      </YStack>
    )
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      {topBar}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ pb: '$10' }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => {
          setShowDatePicker(false)
          setShowServicePicker(false)
        }}
      >
        <Pressable
          onPress={() => {
            setShowDatePicker(false)
            setShowServicePicker(false)
          }}
        >
          <YStack px="$5" pt="$3" gap="$3">
            <YStack gap="$1">
              <ThemedEyebrowText>
                NEW APPOINTMENT LOG
              </ThemedEyebrowText>
              <ThemedHeadingText fontSize={20} fontWeight="700">
                {client.name}
              </ThemedHeadingText>
            </YStack>

            <SectionDivider />

            <SurfaceCard
              p="$4"
              gap="$2.5"
              tone={isGlass ? 'secondary' : 'default'}
              mode="alwaysCard"
            >
              <YStack
                gap="$2"
                onLayout={(event) => {
                  requiredY.current.date = event.nativeEvent.layout.y
                }}
              >
                <FieldLabel>Date</FieldLabel>
                <YStack position="relative">
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation?.()
                    handleDateFieldPress()
                  }}
                >
                  <XStack
                    height={44}
                    px="$3"
                    rounded="$4"
                    borderWidth={1}
                    borderColor={
                      showDateError ? '$red10' : showDatePicker ? '$accent' : '$borderSubtle'
                    }
                    bg="$background"
                    items="center"
                    justify="space-between"
                  >
                    <XStack items="center" gap="$2.5" flex={1}>
                      <CalendarDays size={15} color={showDatePicker ? '$accent' : '$textSecondary'} />
                      <Text
                        fontSize={14}
                        color={form.date ? '$color' : '$textSecondary'}
                        numberOfLines={1}
                        flex={1}
                      >
                        {form.date || 'Select appointment date'}
                      </Text>
                    </XStack>
                    <ChevronDown size={16} color="$textSecondary" />
                  </XStack>
                </Pressable>
                <ErrorPulseBorder active={showDateError} pulseKey={pulseKey} />
              </YStack>
              {Platform.OS === 'android' && showDatePicker ? (
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              ) : null}
              {Platform.OS !== 'android' && datePanel.showPanel ? (
                <YStack position="relative">
                  <YStack
                    position="absolute"
                    l={0}
                    r={0}
                    t={0}
                    opacity={0}
                    pointerEvents="none"
                    onLayout={(event) => {
                      datePanel.setMeasured(event.nativeEvent.layout.height)
                    }}
                  >
                    <YStack rounded="$4" borderWidth={1} borderColor="$borderSubtle" p="$2" bg="$background">
                      <DateTimePicker
                        value={pickerDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={handleDateChange}
                      />
                    </YStack>
                  </YStack>
                  <Animated.View style={[{ overflow: 'hidden' }, datePanel.animatedStyle]}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.()
                      }}
                    >
                      <YStack
                        rounded="$4"
                        borderWidth={1}
                        borderColor="$borderSubtle"
                        p="$2"
                        bg="$background"
                        shadowColor="rgba(15,23,42,0.12)"
                        shadowRadius={14}
                        shadowOpacity={1}
                        shadowOffset={{ width: 0, height: 6 }}
                        elevation={2}
                      >
                        <DateTimePicker
                          value={pickerDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'inline' : 'default'}
                          onChange={handleDateChange}
                        />
                      </YStack>
                    </Pressable>
                  </Animated.View>
                </YStack>
              ) : null}
              {showDateError ? (
                <Text fontSize={11} color="$red10">
                  Date is required.
                </Text>
              ) : null}
            </YStack>
            <YStack gap="$2">
              <FieldLabel>Services</FieldLabel>
              <YStack position="relative">
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation?.()
                    handleServiceFieldPress()
                  }}
                >
                  <XStack
                    height={44}
                    px="$3"
                    rounded="$4"
                    borderWidth={1}
                    borderColor={showServicePicker ? '$accent' : '$borderSubtle'}
                    bg="$background"
                    items="center"
                    justify="space-between"
                  >
                    <Text
                      fontSize={14}
                      color={selectedServices.length ? '$color' : '$textSecondary'}
                    >
                      {selectedServiceSummary}
                    </Text>
                    <ChevronDown size={16} color="$textSecondary" />
                  </XStack>
                </Pressable>
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
                    <YStack rounded="$4" borderWidth={1} borderColor="$borderSubtle" p="$2" bg="$background">
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
                        {serviceOptions.map((service) => {
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
                  </YStack>
                  <Animated.View style={[{ overflow: 'hidden' }, servicePanel.animatedStyle]}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.()
                      }}
                    >
                      <YStack
                        rounded="$4"
                        borderWidth={1}
                        borderColor="$borderSubtle"
                        p="$2"
                        bg="$background"
                        shadowColor="rgba(15,23,42,0.12)"
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
                          {serviceOptions.map((service) => {
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
                    </Pressable>
                  </Animated.View>
                </YStack>
              ) : null}
            </YStack>
            <YStack gap="$2">
              <FieldLabel>Price</FieldLabel>
              <TextField
                placeholder="$0.00"
                value={form.price}
                onFocus={() => {
                  setShowDatePicker(false)
                  setShowServicePicker(false)
                }}
                onChangeText={(text) => setForm((prev) => ({ ...prev, price: text }))}
              />
            </YStack>
            <YStack gap="$2">
              <FieldLabel>Formula / Notes</FieldLabel>
              <TextAreaField
                placeholder="Color formula, technique, notes..."
                value={form.notes}
                onFocus={() => {
                  setShowDatePicker(false)
                  setShowServicePicker(false)
                }}
                onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
              />
            </YStack>
          </SurfaceCard>

          <SurfaceCard
            p="$4"
            gap="$2.5"
            tone={isGlass ? 'secondary' : 'default'}
            mode="alwaysCard"
          >
            <ThemedHeadingText fontWeight="700" fontSize={14}>
              Photos
            </ThemedHeadingText>
            <XStack gap="$3" flexWrap="wrap">
              <SecondaryButton
                icon={<Camera size={16} />}
                size="$4"
                onPress={() => {
                  setShowDatePicker(false)
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
                  setShowDatePicker(false)
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
                        bg="rgba(0,0,0,0.6)"
                        onPress={(event) => {
                          event?.stopPropagation?.()
                          removeImage(index)
                        }}
                      >
                        <X size={12} color="white" />
                      </XStack>
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

          <PrimaryButton
            size="$4"
            disabled={!canSave}
            opacity={canSave ? 1 : 0.5}
            onPress={() => {
              setShowDatePicker(false)
              setShowServicePicker(false)
              void handleSave()
            }}
          >
            {createAppointmentLog.isPending ? 'Saving...' : 'Save Appointment'}
          </PrimaryButton>
          </YStack>
        </Pressable>
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
            backgroundColor: 'rgba(0,0,0,0.85)',
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
