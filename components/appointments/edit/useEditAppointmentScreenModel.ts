import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
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
import { buildDurableAppointmentImageInputs } from 'components/appointments/shared/appointmentImageStorage'
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
  useDeleteAppointmentLog,
  useAppointmentDetail,
  useClients,
  useServices,
  useUpdateAppointmentLog,
} from 'components/data/queries'
import { useAppointmentInteractiveUi } from 'components/appointments/shared/useAppointmentInteractiveUi'
import { successHaptic, warningHaptic } from 'components/utils/haptics'
import {
  buildEditAppointmentInitialForm,
  buildEditAppointmentUpdateInput,
  filterEditableAppointmentServices,
  getEditAppointmentRequiredDateScrollTarget,
  hasEditAppointmentChanges,
  resolveInitialEditAppointmentServiceIds,
  toggleEditAppointmentServiceId,
} from './editAppointmentModelUtils'
import { useKeyboardFormNavigation } from 'components/ui/useKeyboardFormNavigation'

type KeyboardField = 'price' | 'notes'
type TabsResetRoute = { name: '(tabs)'; state?: { routes: { name: string }[] } }
type NestedRouteState = {
  index?: number
  routes?: { name?: string }[]
}

const KEYBOARD_FIELDS: KeyboardField[] = ['price', 'notes']
const QUICK_INSERT_CHARACTERS = ['/', '+', '%', ':', '-', ','] as const
const TAB_ROUTE_NAMES = new Set(['index', 'clients', 'profile'])

export function useEditAppointmentScreenModel() {
  const router = useRouter()
  const rootNavigation = useNavigation('/')
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
  const deleteAppointmentLog = useDeleteAppointmentLog()

  const initialServiceIdsRef = useRef<number[]>([])
  const hasInitializedServicesRef = useRef(false)
  const hasInitializedFormRef = useRef(false)
  const detailsSectionY = useRef(0)
  const detailsGroupY = useRef(0)
  const requiredY = useRef<{ date?: number }>({})
  const focusY = useRef<{ price?: number; notes?: number }>({})

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

  const hasDeviceLocalImages = useMemo(
    () => appointment?.imageRefs?.some((image) => image.storageProvider === 'device_local') ?? false,
    [appointment?.imageRefs]
  )

  const hasRequired = useMemo(() => Boolean(form.date.trim()), [form.date])
  const canSave = useMemo(
    () => {
      const hasChanges = hasEditAppointmentChanges({
        form,
        images,
        initialForm,
        initialImages: appointment?.images ?? [],
        initialServiceIds: initialServiceIdsRef.current,
        selectedServiceIds,
      })

      return (
        (hasChanges || hasDeviceLocalImages) &&
        !updateAppointmentLog.isPending &&
        !deleteAppointmentLog.isPending
      )
    },
    [
      appointment?.images,
      deleteAppointmentLog.isPending,
      form,
      hasDeviceLocalImages,
      images,
      initialForm,
      selectedServiceIds,
      updateAppointmentLog.isPending,
    ]
  )
  const showDateError = attemptedSave && !form.date.trim()
  const pickerDate = useMemo(() => parseDateForPicker(form.date) ?? new Date(), [form.date])
  const keyboardAccessoryId = 'appointment-edit-keyboard-dismiss'
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
    focusAdjacentAfterScrollDelayMs: Platform.OS === 'ios' ? 104 : 72,
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

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (!selectedDate) return
    setForm((prev) => ({ ...prev, date: formatDateFromPicker(selectedDate) }))
  }

  const toggleServiceSelection = (serviceId: number) => {
    setSelectedServiceIds((current) =>
      toggleEditAppointmentServiceId(current, serviceId)
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
    if (!hasRequired || !canSave) {
      if (!hasRequired) {
        void warningHaptic()
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
      const imageInputs = await buildDurableAppointmentImageInputs({
        imageUris: images,
        existingRefs: appointment.imageRefs ?? [],
      })

      await updateAppointmentLog.mutateAsync(
        buildEditAppointmentUpdateInput({
          appointment,
          form,
          imageInputs,
          initialServiceIds: initialServiceIdsRef.current,
          selectedServiceIds,
          selectedServices,
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

  const buildTabsResetRoute = useCallback((): TabsResetRoute => {
    const rootState = rootNavigation.getState()
    const tabsRoute = rootState?.routes.find((route) => route.name === '(tabs)') as
      | { state?: NestedRouteState }
      | undefined
    const tabsState = tabsRoute?.state
    const activeIndex = typeof tabsState?.index === 'number' ? tabsState.index : 0
    const activeTabName = tabsState?.routes?.[activeIndex]?.name

    if (!activeTabName || !TAB_ROUTE_NAMES.has(activeTabName)) {
      return { name: '(tabs)' }
    }

    return {
      name: '(tabs)',
      state: {
        routes: [{ name: activeTabName }],
      },
    }
  }, [rootNavigation])

  const resetAfterAppointmentDelete = useCallback(
    (targetClientId?: string | null) => {
      const tabsRoute = buildTabsResetRoute()

      rootNavigation.dispatch(
        CommonActions.reset({
          index: targetClientId ? 1 : 0,
          routes: targetClientId
            ? [
                tabsRoute,
                {
                  name: 'client/[id]',
                  params: { id: targetClientId },
                },
              ]
            : [tabsRoute],
        })
      )
    },
    [buildTabsResetRoute, rootNavigation]
  )

  const executeDeleteAppointment = useCallback(async () => {
    if (!appointment) return

    try {
      await deleteAppointmentLog.mutateAsync(appointment.id)
      void successHaptic()

      const targetClientId = appointment.clientId || client?.id
      resetAfterAppointmentDelete(targetClientId)
    } catch (error) {
      Alert.alert(
        'Delete Failed',
        error instanceof Error
          ? error.message
          : 'Unable to delete appointment log right now. Please try again.'
      )
    }
  }, [appointment, client?.id, deleteAppointmentLog, resetAfterAppointmentDelete])

  const handleDelete = useCallback(() => {
    if (!appointment || deleteAppointmentLog.isPending) return

    Alert.alert(
      'Delete Appointment Log?',
      'This permanently removes the appointment log and any attached photos. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void warningHaptic()
            void executeDeleteAppointment()
          },
        },
      ]
    )
  }, [appointment, deleteAppointmentLog.isPending, executeDeleteAppointment])

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
    appointment,
    canGoToNextKeyboardField,
    canGoToPreviousKeyboardField,
    canInsertQuickCharacter,
    canSave,
    cardMode,
    cardTone,
    clearSelectedServices,
    client,
    closePickers,
    closeDatePicker,
    closeServicePicker,
    contentBottomPadding,
    datePanel,
    dismissInteractiveUI,
    focusAdjacentKeyboardField,
    form,
    formatPriceFromCents,
    handleBack,
    handleCapture,
    handleDateChange,
    handleDateFieldPress,
    handleDetailsGroupLayout,
    handleDetailsSectionLayout,
    handleNotesBlur,
    handleNotesFocus,
    handleNotesLayout,
    handleNotesSelectionChange,
    handleDelete,
    handlePriceBlur,
    handlePriceFocus,
    handlePriceLayout,
    handleSave,
    handleScroll,
    handleScrollBeginDrag,
    handleServiceFieldPress,
    handleUpload,
    images,
    insertQuickCharacter,
    isBootstrapping,
    isDeletingAppointment: deleteAppointmentLog.isPending,
    isGlass,
    keyboardAccessoryId,
    keyboardDismissMode,
    notesSelection,
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
