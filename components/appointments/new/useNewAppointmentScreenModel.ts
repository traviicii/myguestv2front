import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import {
  formatPriceFromCents,
  getSelectedServiceSummary,
  getSelectedServices,
  getSuggestedPriceCents,
  moveImageToFront,
  prependImages,
  removeImageAtIndex,
} from 'components/appointments/shared/appointmentFormUtils'
import { useClients, useCreateAppointmentLog, useServices } from 'components/data/queries'
import {
  formatDateFromPicker,
  parseDateForPicker,
} from 'components/appointments/shared/datePicker'
import {
  pickAppointmentImagesFromCamera,
  pickAppointmentImagesFromLibrary,
} from 'components/appointments/shared/appointmentImagePicker'
import { useAppointmentInteractiveUi } from 'components/appointments/shared/useAppointmentInteractiveUi'
import {
  buildNewAppointmentCreateInput,
  buildNewAppointmentInitialForm,
  getRequiredDateScrollTarget,
  hasNewAppointmentDraftContent,
  toggleNewAppointmentServiceId,
} from './newAppointmentModelUtils'

export function useNewAppointmentScreenModel() {
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: serviceOptions = [] } = useServices('true')
  const createAppointmentLog = useCreateAppointmentLog()

  const client = clients.find((item) => item.id === id)
  const scrollRef = useRef<any>(null)
  const requiredY = useRef<{ date?: number }>({})
  const defaultDate = useMemo(() => formatDateFromPicker(new Date()), [])

  const [form, setForm] = useState(() => buildNewAppointmentInitialForm(defaultDate))
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [images, setImages] = useState<string[]>([])
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [priceEdited, setPriceEdited] = useState(false)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const {
    closePickers,
    datePanel,
    dismissInteractiveUI,
    handleDateFieldPress,
    handleServiceFieldPress,
    servicePanel,
    setShowDatePicker,
    setShowServicePicker,
    showDatePicker,
    showServicePicker,
  } = useAppointmentInteractiveUi()

  const selectedServices = useMemo(
    () => getSelectedServices(serviceOptions, selectedServiceIds),
    [selectedServiceIds, serviceOptions]
  )

  const selectedServiceSummary = useMemo(
    () => getSelectedServiceSummary(selectedServices),
    [selectedServices]
  )

  const suggestedPriceCents = useMemo(
    () => getSuggestedPriceCents(selectedServices),
    [selectedServices]
  )

  const isBootstrapping = clientsLoading && !clients.length

  useEffect(() => {
    if (priceEdited) return
    setForm((prev) => ({ ...prev, price: formatPriceFromCents(suggestedPriceCents) }))
  }, [priceEdited, suggestedPriceCents])

  const isDirty = useMemo(
    () =>
      hasNewAppointmentDraftContent({
        form,
        selectedServiceIds,
        images,
      }),
    [form, images, selectedServiceIds]
  )

  const hasRequired = useMemo(() => Boolean(form.date.trim()), [form.date])
  const canSave = isDirty && !createAppointmentLog.isPending
  const showDateError = attemptedSave && !form.date.trim()
  const pickerDate = useMemo(() => parseDateForPicker(form.date) ?? new Date(), [form.date])
  const keyboardAccessoryId = 'new-appointment-keyboard-dismiss'
  const keyboardDismissMode =
    Platform.OS === 'ios'
      ? ('interactive' as const)
      : ('on-drag' as const)

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (!selectedDate) return
    setForm((prev) => ({ ...prev, date: formatDateFromPicker(selectedDate) }))
    if (Platform.OS !== 'android') {
      setShowDatePicker(false)
    }
  }

  const toggleServiceSelection = (serviceId: number) => {
    setSelectedServiceIds((current) =>
      toggleNewAppointmentServiceId(current, serviceId)
    )
  }

  const clearSelectedServices = () => setSelectedServiceIds([])

  const handleSave = async () => {
    setAttemptedSave(true)
    if (!hasRequired) {
      const scrollTarget = getRequiredDateScrollTarget(requiredY.current.date)
      if (scrollTarget !== null) {
        scrollRef.current?.scrollTo({
          y: scrollTarget,
          animated: true,
        })
      }
      const delay = scrollTarget !== null ? 350 : 0
      setTimeout(() => {
        setPulseKey((count) => count + 1)
      }, delay)
      return
    }

    if (!client) return

    try {
      await createAppointmentLog.mutateAsync(
        buildNewAppointmentCreateInput({
          clientId: client.id,
          form,
          selectedServiceIds,
          selectedServices,
          images,
        })
      )
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
    setImages((current) => prependImages(current, uris))
  }

  const removeImage = (index: number) => {
    setImages((current) => removeImageAtIndex(current, index))
  }

  const setCoverImage = (index: number) => {
    setImages((current) => moveImageToFront(current, index))
  }

  const handleCapture = async () => {
    const uris = await pickAppointmentImagesFromCamera()
    if (uris.length) {
      addImages(uris)
    }
  }

  const handleUpload = async () => {
    const uris = await pickAppointmentImagesFromLibrary()
    if (uris.length) {
      addImages(uris)
    }
  }

  const handleBack = () => router.back()

  return {
    canSave,
    cardMode: 'alwaysCard' as const,
    cardTone: isGlass ? ('secondary' as const) : ('default' as const),
    clearSelectedServices,
    client,
    closePickers,
    createAppointmentLog,
    datePanel,
    dismissInteractiveUI,
    form,
    formatPriceFromCents,
    handleBack,
    handleCapture,
    handleDateChange,
    handleDateFieldPress,
    handleSave,
    handleServiceFieldPress,
    handleUpload,
    images,
    isBootstrapping,
    keyboardAccessoryId,
    keyboardDismissMode,
    pickerDate,
    previewUri,
    pulseKey,
    removeImage,
    requiredY,
    scrollRef,
    selectedServiceIds,
    selectedServiceSummary,
    selectedServices,
    serviceOptions,
    servicePanel,
    setCoverImage,
    setForm,
    setPreviewUri,
    setPriceEdited,
    setShowDatePicker,
    setShowServicePicker,
    showDateError,
    showDatePicker,
    showServicePicker,
    suggestedPriceCents,
    toggleServiceSelection,
    topInset,
  }
}

export type NewAppointmentScreenModel = ReturnType<typeof useNewAppointmentScreenModel>
