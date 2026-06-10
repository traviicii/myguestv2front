import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { buildDurableAppointmentImageInputs } from 'components/appointments/shared/appointmentImageStorage'
import { useAppointmentInteractiveUi } from 'components/appointments/shared/useAppointmentInteractiveUi'
import { successHaptic, warningHaptic } from 'components/utils/haptics'
import {
  buildNewAppointmentCreateInput,
  buildNewAppointmentInitialForm,
  getRequiredDateScrollTarget,
  hasNewAppointmentDraftContent,
  toggleNewAppointmentServiceId,
} from './newAppointmentModelUtils'
import { useKeyboardFormNavigation } from 'components/ui/useKeyboardFormNavigation'

type KeyboardField = 'price' | 'notes'

const KEYBOARD_FIELDS: KeyboardField[] = ['price', 'notes']
const QUICK_INSERT_CHARACTERS = ['/', '+', '%', ':', '-', ','] as const

export function useNewAppointmentScreenModel() {
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: serviceCatalog = [] } = useServices('all')
  const createAppointmentLog = useCreateAppointmentLog()

  const client = clients.find((item) => item.id === id)
  const detailsSectionY = useRef(0)
  const detailsGroupY = useRef(0)
  const requiredY = useRef<{ date?: number }>({})
  const focusY = useRef<{ price?: number; notes?: number }>({})
  const defaultDate = useMemo(() => formatDateFromPicker(new Date()), [])

  const [form, setForm] = useState(() => buildNewAppointmentInitialForm(defaultDate))
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [images, setImages] = useState<string[]>([])
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [priceEdited, setPriceEdited] = useState(false)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [notesSelection, setNotesSelection] = useState({ start: 0, end: 0 })
  const {
    closePickers,
    closeDatePicker,
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

  const pickerServices = useMemo(
    () => serviceCatalog.filter((service) => service.isActive),
    [serviceCatalog]
  )

  const selectedServices = useMemo(
    () => getSelectedServices(serviceCatalog, selectedServiceIds),
    [selectedServiceIds, serviceCatalog]
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
  const contentBottomPadding = Math.max(48, insets.bottom + 48)

  const resolveDetailsFieldTarget = useCallback((targetY?: number) => {
    if (typeof targetY !== 'number') {
      return undefined
    }

    return detailsSectionY.current + detailsGroupY.current + targetY
  }, [])

  const {
    activeKeyboardField,
    canGoToNextKeyboardField,
    canGoToPreviousKeyboardField,
    focusAdjacentKeyboardField,
    focusKeyboardField,
    handleKeyboardFieldBlur,
    handleKeyboardFieldFocus,
    handleScroll,
    handleScrollBeginDrag: handleKeyboardScrollBeginDrag,
    keyboardDismissMode,
    scrollRef,
    setInputRef,
  } = useKeyboardFormNavigation<KeyboardField>({
    fields: KEYBOARD_FIELDS,
    getFocusOffset: (field) =>
      field === 'notes'
        ? Platform.OS === 'ios'
          ? 148
          : 124
        : Platform.OS === 'ios'
          ? 196
          : 164,
    resolveFieldTarget: (field) =>
      resolveDetailsFieldTarget(
        field === 'notes' ? focusY.current.notes : focusY.current.price
      ),
  })

  const handleDetailsSectionLayout = useCallback((y: number) => {
    detailsSectionY.current = y
  }, [])

  const handleDetailsGroupLayout = useCallback((y: number) => {
    detailsGroupY.current = y
  }, [])

  const handleDateLayout = useCallback((y: number) => {
    requiredY.current.date = y
  }, [])

  const handlePriceLayout = useCallback((y: number) => {
    focusY.current.price = y
  }, [])

  const handleNotesLayout = useCallback((y: number) => {
    focusY.current.notes = y
  }, [])

  const handleNotesSelectionChange = useCallback(
    (event: { nativeEvent: { selection: { start: number; end: number } } }) => {
      setNotesSelection(event.nativeEvent.selection)
    },
    []
  )

  const insertQuickCharacter = useCallback(
    (character: string) => {
      if (activeKeyboardField !== 'notes') return

      const { start, end } = notesSelection
      const safeStart = Math.max(0, Math.min(start, form.notes.length))
      const safeEnd = Math.max(safeStart, Math.min(end, form.notes.length))
      const nextNotes =
        form.notes.slice(0, safeStart) +
        character +
        form.notes.slice(safeEnd)
      const nextCursor = safeStart + character.length

      setForm((prev) => ({ ...prev, notes: nextNotes }))
      setNotesSelection({ start: nextCursor, end: nextCursor })

      setTimeout(() => {
        focusKeyboardField('notes')
      }, 0)
    },
    [activeKeyboardField, focusKeyboardField, form.notes, notesSelection]
  )

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (!selectedDate) return
    setForm((prev) => ({ ...prev, date: formatDateFromPicker(selectedDate) }))
  }

  const toggleServiceSelection = (serviceId: number) => {
    setSelectedServiceIds((current) =>
      toggleNewAppointmentServiceId(current, serviceId)
    )
  }

  const selectService = (serviceId: number) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId) ? current : [...current, serviceId]
    )
  }

  const clearSelectedServices = () => setSelectedServiceIds([])

  const handleSave = async () => {
    setAttemptedSave(true)
    if (!hasRequired) {
      void warningHaptic()
      const scrollTarget = getRequiredDateScrollTarget(
        resolveDetailsFieldTarget(requiredY.current.date)
      )
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
      const imageInputs = await buildDurableAppointmentImageInputs({
        imageUris: images,
      })

      await createAppointmentLog.mutateAsync(
        buildNewAppointmentCreateInput({
          clientId: client.id,
          form,
          selectedServiceIds,
          selectedServices,
          imageInputs,
        })
      )
      void successHaptic()
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

  const handleNotesFocus = useCallback(() => {
    closePickers()
    handleKeyboardFieldFocus('notes')
  }, [closePickers, handleKeyboardFieldFocus])

  const handleNotesBlur = useCallback(() => {
    handleKeyboardFieldBlur('notes')
  }, [handleKeyboardFieldBlur])

  const handlePriceFocus = useCallback(() => {
    closePickers()
    handleKeyboardFieldFocus('price')
  }, [closePickers, handleKeyboardFieldFocus])

  const handlePriceBlur = useCallback(() => {
    handleKeyboardFieldBlur('price')
  }, [handleKeyboardFieldBlur])

  const handleScrollBeginDrag = () => {
    handleKeyboardScrollBeginDrag()
    if (showDatePicker) {
      setShowDatePicker(false)
    }
  }
  const canInsertQuickCharacter = activeKeyboardField === 'notes'

  return {
    activeKeyboardField,
    canSave,
    canGoToNextKeyboardField,
    canGoToPreviousKeyboardField,
    canInsertQuickCharacter,
    cardMode: 'alwaysCard' as const,
    cardTone: isGlass ? ('secondary' as const) : ('default' as const),
    clearSelectedServices,
    client,
    closePickers,
    closeDatePicker,
    closeServicePicker,
    createAppointmentLog,
    datePanel,
    dismissInteractiveUI,
    form,
    focusAdjacentKeyboardField,
    formatPriceFromCents,
    handleBack,
    handleCapture,
    handleDateChange,
    handleDateLayout,
    handleDateFieldPress,
    handleDetailsSectionLayout,
    handleDetailsGroupLayout,
    handleNotesFocus,
    handleNotesBlur,
    handleNotesLayout,
    handlePriceFocus,
    handlePriceBlur,
    handlePriceLayout,
    handleNotesSelectionChange,
    handleSave,
    handleScroll,
    handleScrollBeginDrag,
    handleServiceFieldPress,
    handleUpload,
    images,
    isBootstrapping,
    keyboardAccessoryId,
    keyboardDismissMode,
    contentBottomPadding,
    pickerDate,
    pickerServices,
    previewUri,
    pulseKey,
    quickInsertCharacters: QUICK_INSERT_CHARACTERS,
    removeImage,
    requiredY,
    scrollRef,
    selectedServiceIds,
    selectedServiceSummary,
    selectedServices,
    serviceCatalog,
    servicePanel,
    selectService,
    setCoverImage,
    setForm,
    setInputRef,
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
    insertQuickCharacter,
    notesSelection,
  }
}

export type NewAppointmentScreenModel = ReturnType<typeof useNewAppointmentScreenModel>
