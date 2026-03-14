import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Keyboard, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import {
  formatDateFromPicker,
  parseDateForPicker,
} from 'components/appointments/shared/datePicker'
import {
  pickAppointmentImagesFromCamera,
  pickAppointmentImagesFromLibrary,
} from 'components/appointments/shared/appointmentImagePicker'
import {
  formatPriceFromCents,
  getSelectedServiceSummary,
  getSelectedServices,
  getSuggestedPriceCents,
  moveImageToFront,
  prependImages,
  removeImageAtIndex,
} from 'components/appointments/shared/appointmentFormUtils'
import {
  useAppointmentDetail,
  useClients,
  useServices,
  useUpdateAppointmentLog,
} from 'components/data/queries'
import { useAppointmentInteractiveUi } from 'components/appointments/shared/useAppointmentInteractiveUi'
import {
  buildEditAppointmentInitialForm,
  buildEditAppointmentUpdateInput,
  filterEditableAppointmentServices,
  getEditAppointmentRequiredDateScrollTarget,
  hasEditAppointmentChanges,
  resolveInitialEditAppointmentServiceIds,
  toggleEditAppointmentServiceId,
} from './editAppointmentModelUtils'

export function useEditAppointmentScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const isModern = aesthetic === 'modern'
  const cardTone = isGlass ? ('secondary' as const) : ('default' as const)
  const cardMode = isModern ? ('section' as const) : ('alwaysCard' as const)

  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: appointment, isLoading: appointmentLoading } = useAppointmentDetail(id)
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: serviceCatalog = [] } = useServices('all')
  const updateAppointmentLog = useUpdateAppointmentLog()

  const scrollRef = useRef<any>(null)
  const initialServiceIdsRef = useRef<number[]>([])
  const hasInitializedServicesRef = useRef(false)
  const hasInitializedFormRef = useRef(false)
  const requiredY = useRef<{ date?: number }>({})

  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const {
    closePickers,
    closeServicePicker,
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

  const client = clients.find((item) => item.id === appointment?.clientId)
  const isBootstrapping = (appointmentLoading || clientsLoading) && !appointment

  const initialForm = useMemo(
    () => buildEditAppointmentInitialForm(appointment),
    [appointment]
  )

  const [form, setForm] = useState(initialForm)
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [images, setImages] = useState<string[]>(appointment?.images ?? [])
  const [previewUri, setPreviewUri] = useState<string | null>(null)


  const selectedServices = useMemo(
    () => getSelectedServices(serviceCatalog, selectedServiceIds),
    [serviceCatalog, selectedServiceIds]
  )

  const pickerServices = useMemo(
    () => filterEditableAppointmentServices(serviceCatalog, selectedServiceIds),
    [serviceCatalog, selectedServiceIds]
  )

  const selectedServiceSummary = useMemo(
    () => getSelectedServiceSummary(selectedServices),
    [selectedServices]
  )

  const suggestedPriceCents = useMemo(
    () => getSuggestedPriceCents(selectedServices),
    [selectedServices]
  )

  useEffect(() => {
    if (!appointment || hasInitializedFormRef.current) return
    setForm(buildEditAppointmentInitialForm(appointment))
    setImages(appointment.images ?? [])
    hasInitializedFormRef.current = true
  }, [appointment])

  useEffect(() => {
    if (!appointment || hasInitializedServicesRef.current) return

    const initialIds = resolveInitialEditAppointmentServiceIds(appointment, serviceCatalog)
    if (initialIds === null) return

    initialServiceIdsRef.current = initialIds
    setSelectedServiceIds(initialIds)
    hasInitializedServicesRef.current = true
  }, [appointment, serviceCatalog])

  const isDirty = useMemo(
    () =>
      hasEditAppointmentChanges({
        form,
        images,
        initialForm,
        initialImages: appointment?.images ?? [],
        initialServiceIds: initialServiceIdsRef.current,
        selectedServiceIds,
      }),
    [appointment?.images, form, images, initialForm, selectedServiceIds]
  )

  const hasRequired = useMemo(() => Boolean(form.date.trim()), [form.date])
  const canSave = isDirty && !updateAppointmentLog.isPending
  const showDateError = attemptedSave && !form.date.trim()
  const pickerDate = useMemo(() => parseDateForPicker(form.date) ?? new Date(), [form.date])
  const keyboardAccessoryId = 'appointment-edit-keyboard-dismiss'
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
      toggleEditAppointmentServiceId(current, serviceId)
    )
  }

  const clearSelectedServices = () => setSelectedServiceIds([])

  const applySuggestedPrice = () => {
    if (suggestedPriceCents === null) return
    setForm((prev) => ({
      ...prev,
      price: formatPriceFromCents(suggestedPriceCents),
    }))
  }

  const handleSave = async () => {
    setAttemptedSave(true)
    if (!hasRequired || !isDirty) {
      if (!hasRequired) {
        const scrollTarget = getEditAppointmentRequiredDateScrollTarget(requiredY.current.date)
        if (scrollTarget !== null) {
          scrollRef.current?.scrollTo({
            y: scrollTarget,
            animated: true,
          })
          setTimeout(() => {
            setPulseKey((count) => count + 1)
          }, 350)
        } else {
          setPulseKey((count) => count + 1)
        }
      }
      return
    }

    if (!appointment) return

    try {
      await updateAppointmentLog.mutateAsync(
        buildEditAppointmentUpdateInput({
          appointment,
          form,
          images,
          initialServiceIds: initialServiceIdsRef.current,
          selectedServiceIds,
          selectedServices,
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

  const handleScrollBeginDrag = () => {
    Keyboard.dismiss()
    closePickers()
  }

  return {
    appointment,
    applySuggestedPrice,
    canSave,
    cardMode,
    cardTone,
    clearSelectedServices,
    client,
    closePickers,
    closeServicePicker,
    datePanel,
    dismissInteractiveUI,
    form,
    formatPriceFromCents,
    handleBack,
    handleCapture,
    handleDateChange,
    handleDateFieldPress,
    handleSave,
    handleScrollBeginDrag,
    handleServiceFieldPress,
    handleUpload,
    images,
    isBootstrapping,
    isGlass,
    keyboardAccessoryId,
    keyboardDismissMode,
    pickerDate,
    pickerServices,
    previewUri,
    pulseKey,
    removeImage,
    requiredY,
    scrollRef,
    selectedServiceIds,
    selectedServiceSummary,
    selectedServices,
    servicePanel,
    setCoverImage,
    setForm,
    setPreviewUri,
    setSelectedServiceIds,
    setShowDatePicker,
    setShowServicePicker,
    showDateError,
    showDatePicker,
    showServicePicker,
    suggestedPriceCents,
    toggleServiceSelection,
    topInset,
    updateAppointmentLog,
  }
}

export type EditAppointmentScreenModel = ReturnType<typeof useEditAppointmentScreenModel>
