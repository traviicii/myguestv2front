import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

import {
  canAdvanceOnboardingClientStep,
  formatOnboardingTodayLabel,
  getOnboardingStepTitle,
  getSelectedOnboardingServiceName,
  normalizeOnboardingPrice,
  type OnboardingClientType,
  type OnboardingStep,
} from './onboardingModelUtils'

export function useOnboardingScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const { profile, setProfile, setOnboardingComplete } = useStudioStore()
  const { data: serviceOptions = [] } = useServices('true')
  const createService = useCreateService()
  const createClient = useCreateClient()
  const createAppointmentLog = useCreateAppointmentLog()

  const [step, setStep] = useState<OnboardingStep>(1)
  const [profileDraft, setProfileDraft] = useState(profile)
  const [serviceDraft, setServiceDraft] = useState('')
  const [clientDraft, setClientDraft] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    clientType: 'Cut' as OnboardingClientType,
  })
  const [createdClientId, setCreatedClientId] = useState<string | null>(null)
  const [appointmentDraft, setAppointmentDraft] = useState({
    date: formatOnboardingTodayLabel(),
    price: '',
    notes: '',
  })
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [newServiceName, setNewServiceName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const cardTone: SurfaceTone = isGlass ? 'secondary' : 'default'

  const handleProfileNext = () => {
    setProfile({
      name: profileDraft.name.trim(),
      email: profileDraft.email.trim(),
      phone: profileDraft.phone.trim(),
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
        phone: clientDraft.phone.trim() || undefined,
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

      setOnboardingComplete(true)
      router.replace('/(tabs)')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    appointmentDraft,
    cardTone,
    canAdvanceClient: canAdvanceOnboardingClientStep(
      clientDraft.firstName,
      clientDraft.lastName
    ),
    clientDraft,
    createdClientId,
    handleAddService,
    handleClientNext,
    handleFinish,
    handleProfileNext,
    handleSaveNewService,
    insets,
    isSaving,
    newServiceName,
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
    step,
    stepTitle: getOnboardingStepTitle(step),
  }
}

export type OnboardingScreenModel = ReturnType<typeof useOnboardingScreenModel>
