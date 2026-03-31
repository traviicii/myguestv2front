import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuth } from 'components/auth/AuthProvider'
import {
  formatDateFromPicker,
  parseDateForPicker,
} from 'components/appointments/shared/datePicker'
import { useAppointmentInteractiveUi } from 'components/appointments/shared/useAppointmentInteractiveUi'
import { useThemePrefs } from 'components/ThemePrefs'
import {
  useCreateAppointmentLog,
  useCreateClient,
  useCreateService,
  useServices,
} from 'components/data/queries'
import { useStudioStore } from 'components/state/studioStore'
import type { SurfaceTone } from 'components/ui/controlShared'
import { normalizeServiceName } from 'components/utils/services'
import { formatPhoneForInput, normalizePhoneForStorage } from 'components/utils/phone'

import {
  canGoBackOnboardingStep,
  canAdvanceOnboardingClientStep,
  getPreviousOnboardingStep,
  getOnboardingStepTitle,
  getOnboardingStepSubtitle,
  getSelectedOnboardingServiceName,
  normalizeOnboardingPrice,
  type OnboardingClientType,
  type OnboardingStep,
} from './onboardingModelUtils'

export function useOnboardingScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { aesthetic } = useThemePrefs()
  const { user } = useAuth()
  const isGlass = aesthetic === 'glass'
  const { profile, setProfile, setOnboardingComplete } = useStudioStore()
  const { data: serviceOptions = [] } = useServices('true')
  const createService = useCreateService()
  const createClient = useCreateClient()
  const createAppointmentLog = useCreateAppointmentLog()

  const [step, setStep] = useState<OnboardingStep>(1)
  const [profileDraft, setProfileDraft] = useState(() => ({
    ...profile,
    phone: formatPhoneForInput(profile.phone),
  }))
  const [serviceDraft, setServiceDraft] = useState('')
  const [clientDraft, setClientDraft] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    clientType: 'Cut' as OnboardingClientType,
  })
  const [createdClientId, setCreatedClientId] = useState<string | null>(null)
  const defaultDate = useMemo(() => formatDateFromPicker(new Date()), [])
  const [appointmentDraft, setAppointmentDraft] = useState({
    date: defaultDate,
    price: '',
    notes: '',
  })
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [newServiceName, setNewServiceName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const {
    closePickers,
    datePanel,
    dismissInteractiveUI,
    handleDateFieldPress,
    setShowDatePicker,
    showDatePicker,
  } = useAppointmentInteractiveUi()
  const cardTone: SurfaceTone = isGlass ? 'secondary' : 'default'
  const authEmail = user?.email?.trim() ?? ''
  const pickerDate = useMemo(
    () => parseDateForPicker(appointmentDraft.date) ?? new Date(),
    [appointmentDraft.date]
  )

  useEffect(() => {
    if (!authEmail || profileDraft.email.trim()) return
    setProfileDraft((current) => ({ ...current, email: authEmail }))
  }, [authEmail, profileDraft.email])

  const finalizeOnboarding = (href: '/' | `/client/${string}`) => {
    setOnboardingComplete(true)
    router.replace(href)
  }

  const canGoBack = canGoBackOnboardingStep(step)

  const handleBackStep = () => {
    if (!canGoBack) return
    setStep((current) => getPreviousOnboardingStep(current))
  }

  const handleProfileNext = () => {
    setProfile({
      name: profileDraft.name.trim(),
      email: authEmail || profileDraft.email.trim(),
      phone: normalizePhoneForStorage(profileDraft.phone),
    })
    setStep(2)
  }

  const handleAddService = async () => {
    const normalized = normalizeServiceName(serviceDraft)
    if (!normalized) return
    try {
      await createService.mutateAsync({ name: normalized })
      setServiceDraft('')
    } catch {
      // Keep onboarding non-blocking; user can add services later.
    }
  }

  const handleClientNext = async () => {
    if (!canAdvanceOnboardingClientStep(clientDraft.firstName, clientDraft.lastName)) {
      return
    }
    setIsSaving(true)
    try {
      const client = await createClient.mutateAsync({
        firstName: clientDraft.firstName.trim(),
        lastName: clientDraft.lastName.trim(),
        email: clientDraft.email.trim() || undefined,
        phone: normalizePhoneForStorage(clientDraft.phone) || undefined,
        clientType: clientDraft.clientType,
      })
      setCreatedClientId(client.id)
      setStep(4)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNewService = async () => {
    const normalized = normalizeServiceName(newServiceName)
    if (!normalized) return
    try {
      const service = await createService.mutateAsync({ name: normalized })
      setSelectedServiceId(service.id)
      setNewServiceName('')
    } catch {
      // Keep onboarding moving; service creation can be retried later.
    }
  }

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (!selectedDate) return
    setAppointmentDraft((prev) => ({ ...prev, date: formatDateFromPicker(selectedDate) }))
    if (Platform.OS !== 'android') {
      setShowDatePicker(false)
    }
  }

  const handleFinish = async () => {
    if (!createdClientId) return

    setIsSaving(true)
    try {
      const serviceIds = selectedServiceId ? [selectedServiceId] : []
      const primaryService = getSelectedOnboardingServiceName(
        serviceOptions,
        selectedServiceId
      )

      await createAppointmentLog.mutateAsync({
        clientId: createdClientId,
        serviceIds,
        serviceType: primaryService ? normalizeServiceName(primaryService) : null,
        notes: appointmentDraft.notes,
        price: normalizeOnboardingPrice(appointmentDraft.price),
        date: appointmentDraft.date,
      })

      finalizeOnboarding('/')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinishWithoutAppointment = () => {
    if (!createdClientId) return
    finalizeOnboarding(`/client/${createdClientId}`)
  }

  return {
    authEmail,
    appointmentDraft,
    cardTone,
    canAdvanceClient: canAdvanceOnboardingClientStep(
      clientDraft.firstName,
      clientDraft.lastName
    ),
    canGoBack,
    clientDraft,
    closePickers,
    createdClientId,
    datePanel,
    dismissInteractiveUI,
    handleAddService,
    handleBackStep,
    handleClientNext,
    handleDateChange,
    handleDateFieldPress,
    handleFinish,
    handleFinishWithoutAppointment,
    handleProfileNext,
    handleSaveNewService,
    insets,
    isSaving,
    newServiceName,
    pickerDate,
    profileDraft,
    selectedServiceId,
    serviceDraft,
    serviceOptions,
    setAppointmentDraft,
    setClientDraft,
    setNewServiceName,
    setProfileDraft,
    setSelectedServiceId,
    setServiceDraft,
    setStep,
    setShowDatePicker,
    step,
    stepSubtitle: getOnboardingStepSubtitle(step),
    stepTitle: getOnboardingStepTitle(step),
    showDatePicker,
  }
}

export type OnboardingScreenModel = ReturnType<typeof useOnboardingScreenModel>
