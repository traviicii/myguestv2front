import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  useAppointmentHistory,
  useClients,
  useCreateAppointmentLog,
  useCreateService,
  useServices,
} from 'components/data/queries'
import { useFollowUpsStore } from 'components/state/followUpsStore'
import { normalizeServiceName } from 'components/utils/services'
import { useDebouncedValue } from 'components/utils/useDebouncedValue'

import {
  FOLLOW_UP_WEEKS,
  addWeeks,
  buildQuickLogFollowUpMessage,
  buildTodayLabel,
  filterQuickLogClients,
  findLastAppointmentForClient,
  parseQuickLogDateInput,
  resolveQuickLogDefaultFollowUpDate,
  resolveQuickLogNextServiceId,
  type FollowUpChannel,
} from './modelUtils'

export function useQuickLogScreenModel() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: clients = [] } = useClients()
  const { data: serviceOptions = [] } = useServices('true')
  const { data: appointmentHistory = [] } = useAppointmentHistory()
  const createAppointmentLog = useCreateAppointmentLog()
  const createService = useCreateService()
  const addFollowUp = useFollowUpsStore((state) => state.addFollowUp)

  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebouncedValue(searchText, 200)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [newServiceName, setNewServiceName] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(buildTodayLabel())
  const [followUpChannel, setFollowUpChannel] = useState<FollowUpChannel>('sms')
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [hasEditedMessage, setHasEditedMessage] = useState(false)
  const [followUpDate, setFollowUpDate] = useState(() =>
    resolveQuickLogDefaultFollowUpDate(buildTodayLabel())
  )
  const [hasEditedFollowUpDate, setHasEditedFollowUpDate] = useState(false)
  const previousClientIdRef = useRef<string | null>(null)

  const filteredClients = useMemo(
    () => filterQuickLogClients(clients, searchText, debouncedSearchText),
    [clients, debouncedSearchText, searchText]
  )

  const selectedClient = clients.find((client) => client.id === selectedClientId) || null
  const primaryService = serviceOptions.find((item) => item.id === selectedServiceId)
  const lastAppointment = useMemo(
    () => findLastAppointmentForClient(appointmentHistory, selectedClientId),
    [appointmentHistory, selectedClientId]
  )

  const defaultFollowUpDate = useMemo(
    () => resolveQuickLogDefaultFollowUpDate(date),
    [date]
  )

  useEffect(() => {
    const currentClientId = selectedClientId ?? null
    const clientChanged = currentClientId !== previousClientIdRef.current
    previousClientIdRef.current = currentClientId

    if (!selectedClient) {
      setFollowUpMessage('')
      setHasEditedMessage(false)
      return
    }

    if (clientChanged) {
      setFollowUpMessage(buildQuickLogFollowUpMessage(selectedClient.name, followUpChannel))
      setHasEditedMessage(false)
      return
    }

    if (!hasEditedMessage) {
      setFollowUpMessage(buildQuickLogFollowUpMessage(selectedClient.name, followUpChannel))
    }
  }, [followUpChannel, hasEditedMessage, selectedClient, selectedClientId])

  useEffect(() => {
    if (hasEditedFollowUpDate) return
    setFollowUpDate(defaultFollowUpDate)
  }, [defaultFollowUpDate, hasEditedFollowUpDate])

  useEffect(() => {
    if (!selectedClientId || !lastAppointment) return
    if (!selectedServiceId) {
      const nextServiceId = resolveQuickLogNextServiceId(lastAppointment, serviceOptions)
      if (nextServiceId) {
        setSelectedServiceId(nextServiceId)
      }
    }
    if (!price && lastAppointment.price) {
      setPrice(String(lastAppointment.price))
    }
  }, [lastAppointment, price, selectedClientId, selectedServiceId, serviceOptions])

  const resetForm = () => {
    setSelectedClientId(null)
    setSelectedServiceId(null)
    setNewServiceName('')
    setPrice('')
    setNotes('')
    setDate(buildTodayLabel())
    setFollowUpChannel('sms')
    setFollowUpMessage('')
    setHasEditedMessage(false)
    setHasEditedFollowUpDate(false)
  }

  const handleSaveNewService = async () => {
    const normalized = normalizeServiceName(newServiceName)
    if (!normalized) return
    try {
      const service = await createService.mutateAsync({ name: normalized })
      setSelectedServiceId(service.id)
      setNewServiceName('')
    } catch {
      // no-op
    }
  }

  const handleSave = async (withFollowUp: boolean) => {
    if (!selectedClient) return
    const numericPrice = price.trim() ? Number(price) : null

    await createAppointmentLog.mutateAsync({
      clientId: selectedClient.id,
      serviceIds: selectedServiceId ? [selectedServiceId] : [],
      serviceType: primaryService ? normalizeServiceName(primaryService.name) : null,
      notes,
      price: Number.isNaN(numericPrice) ? null : numericPrice,
      date,
    })

    if (withFollowUp) {
      const parsedDue = parseQuickLogDateInput(followUpDate)
      const baseDate = parseQuickLogDateInput(date) ?? new Date()
      const dueDate = parsedDue ?? addWeeks(baseDate, FOLLOW_UP_WEEKS)

      addFollowUp({
        clientId: selectedClient.id,
        dueAt: dueDate.toISOString(),
        channel: followUpChannel,
        message:
          followUpMessage || buildQuickLogFollowUpMessage(selectedClient.name, followUpChannel),
      })
    }

    router.back()
    resetForm()
  }

  return {
    contentPaddingBottom: Math.max(24, insets.bottom + 16),
    date,
    filteredClients,
    followUpChannel,
    followUpDate,
    followUpMessage,
    handleSave,
    handleSaveNewService,
    hasSelectedClient: Boolean(selectedClient),
    newServiceName,
    notes,
    price,
    searchText,
    selectedClient,
    selectedServiceId,
    serviceOptions,
    setDate,
    setFollowUpChannel,
    setFollowUpDate: (value: string) => {
      setHasEditedFollowUpDate(true)
      setFollowUpDate(value)
    },
    setFollowUpMessage: (value: string) => {
      setHasEditedMessage(true)
      setFollowUpMessage(value)
    },
    setNewServiceName,
    setNotes,
    setPrice,
    setSearchText,
    setSelectedClientId,
    setSelectedServiceId,
    topPadding: Math.max(insets.top + 16, 24),
  }
}

export type QuickLogScreenModel = ReturnType<typeof useQuickLogScreenModel>
