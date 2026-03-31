import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'
import { useToastController } from '@tamagui/toast'

import {
  useCreateService,
  useDeactivateService,
  usePermanentlyDeleteService,
  useReactivateService,
  useServices,
  useUpdateService,
} from 'components/data/queries'
import { normalizeServiceName } from 'components/utils/services'

import { showSettingsInfo } from './settingsInfo'
import {
  formatPriceInput,
  parsePriceInputToCents,
  removeDraftEntry,
  sortActiveServices,
  sortInactiveServices,
} from './settingsModelUtils'
import {
  buildServiceReorderUpdates,
  hasServiceNameConflict,
} from './settingsServiceManagementUtils'

export function useSettingsServiceManagement() {
  const toast = useToastController()
  const [serviceDraft, setServiceDraft] = useState('')
  const [servicePriceDraft, setServicePriceDraft] = useState('')
  const [optimisticActiveOrder, setOptimisticActiveOrder] = useState<number[] | null>(null)
  const [reorderPulseKeys, setReorderPulseKeys] = useState<Record<number, number>>({})
  const [renameDrafts, setRenameDrafts] = useState<Record<number, string>>({})
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({})
  const [renameSaveStates, setRenameSaveStates] = useState<
    Record<number, 'idle' | 'editing' | 'saving' | 'saved' | 'error'>
  >({})
  const [priceSaveStates, setPriceSaveStates] = useState<
    Record<number, 'idle' | 'editing' | 'saving' | 'saved' | 'error'>
  >({})
  const renameSaveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const priceSaveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const { data: serviceCatalog = [] } = useServices('all')
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deactivateService = useDeactivateService()
  const permanentlyDeleteService = usePermanentlyDeleteService()
  const reactivateService = useReactivateService()

  const activeServices = useMemo(
    () => {
      const sorted = sortActiveServices(serviceCatalog)
      if (!optimisticActiveOrder?.length) {
        return sorted
      }

      const serviceById = new Map(sorted.map((service) => [service.id, service]))
      const optimisticIds = new Set(optimisticActiveOrder)
      const ordered = optimisticActiveOrder
        .map((id) => serviceById.get(id))
        .filter((service): service is NonNullable<typeof service> => Boolean(service))
      const remaining = sorted.filter((service) => !optimisticIds.has(service.id))
      return [...ordered, ...remaining]
    },
    [optimisticActiveOrder, serviceCatalog]
  )

  const inactiveServices = useMemo(
    () => sortInactiveServices(serviceCatalog),
    [serviceCatalog]
  )

  const canAddService = Boolean(normalizeServiceName(serviceDraft))

  useEffect(() => {
    return () => {
      Object.values(renameSaveTimers.current).forEach((timer) => clearTimeout(timer))
      Object.values(priceSaveTimers.current).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const clearRenameSaveTimer = (serviceId: number) => {
    const timer = renameSaveTimers.current[serviceId]
    if (!timer) return
    clearTimeout(timer)
    delete renameSaveTimers.current[serviceId]
  }

  const clearPriceSaveTimer = (serviceId: number) => {
    const timer = priceSaveTimers.current[serviceId]
    if (!timer) return
    clearTimeout(timer)
    delete priceSaveTimers.current[serviceId]
  }

  const setRenameSaveState = (
    serviceId: number,
    state: 'idle' | 'editing' | 'saving' | 'saved' | 'error'
  ) => {
    clearRenameSaveTimer(serviceId)
    setRenameSaveStates((prev) => {
      if (state === 'idle') {
        if (!(serviceId in prev)) return prev
        const next = { ...prev }
        delete next[serviceId]
        return next
      }
      return { ...prev, [serviceId]: state }
    })
  }

  const setPriceSaveState = (
    serviceId: number,
    state: 'idle' | 'editing' | 'saving' | 'saved' | 'error'
  ) => {
    clearPriceSaveTimer(serviceId)
    setPriceSaveStates((prev) => {
      if (state === 'idle') {
        if (!(serviceId in prev)) return prev
        const next = { ...prev }
        delete next[serviceId]
        return next
      }
      return { ...prev, [serviceId]: state }
    })
  }

  const markRenameSaved = (serviceId: number) => {
    setRenameSaveState(serviceId, 'saved')
    renameSaveTimers.current[serviceId] = setTimeout(() => {
      setRenameSaveStates((prev) => {
        if (prev[serviceId] !== 'saved') return prev
        const next = { ...prev }
        delete next[serviceId]
        return next
      })
      delete renameSaveTimers.current[serviceId]
    }, 1800)
  }

  const markPriceSaved = (serviceId: number) => {
    setPriceSaveState(serviceId, 'saved')
    priceSaveTimers.current[serviceId] = setTimeout(() => {
      setPriceSaveStates((prev) => {
        if (prev[serviceId] !== 'saved') return prev
        const next = { ...prev }
        delete next[serviceId]
        return next
      })
      delete priceSaveTimers.current[serviceId]
    }, 1800)
  }

  const handleRenameDraftChange = (serviceId: number, text: string) => {
    setRenameDrafts((prev) => ({
      ...prev,
      [serviceId]: text,
    }))
    setRenameSaveState(serviceId, 'editing')
  }

  const handlePriceDraftChange = (serviceId: number, text: string) => {
    setPriceDrafts((prev) => ({
      ...prev,
      [serviceId]: text,
    }))
    setPriceSaveState(serviceId, 'editing')
  }

  const handleAddService = async () => {
    const normalized = normalizeServiceName(serviceDraft)
    if (!normalized) return

    const defaultPriceCents = parsePriceInputToCents(servicePriceDraft)
    if (defaultPriceCents === undefined) {
      showSettingsInfo(
        'Invalid price',
        'Use a valid amount like 95 or 95.50, or leave blank.'
      )
      return
    }

    const alreadyExists = hasServiceNameConflict(serviceCatalog, normalized)
    if (alreadyExists) {
      showSettingsInfo('Already listed', `${normalized} is already in your service list.`)
      return
    }

    try {
      await createService.mutateAsync({
        name: normalized,
        sortOrder: activeServices.length,
        defaultPriceCents,
      })
      setServiceDraft('')
      setServicePriceDraft('')
      toast.show('Service added', {
        message: `${normalized} is ready in appointment logs.`,
      })
    } catch (error) {
      showSettingsInfo(
        'Unable to add service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleDeactivateService = async (serviceId: number) => {
    if (activeServices.length <= 1) {
      showSettingsInfo(
        'At least one service',
        'Keep at least one active service in the list.'
      )
      return
    }

    try {
      await deactivateService.mutateAsync(serviceId)
    } catch (error) {
      showSettingsInfo(
        'Unable to remove service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleReactivateService = async (serviceId: number) => {
    try {
      await reactivateService.mutateAsync(serviceId)
      await updateService.mutateAsync({
        serviceId,
        sortOrder: activeServices.length,
      })
    } catch (error) {
      showSettingsInfo(
        'Unable to reactivate service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleRenameService = async (serviceId: number, currentName: string) => {
    const draft = renameDrafts[serviceId]
    if (draft === undefined) {
      setRenameSaveState(serviceId, 'idle')
      return
    }

    const normalized = normalizeServiceName(draft)
    if (!normalized) {
      setRenameDrafts((prev) => ({ ...prev, [serviceId]: currentName }))
      setRenameSaveState(serviceId, 'error')
      return
    }

    if (normalized === currentName) {
      setRenameDrafts((prev) => removeDraftEntry(prev, serviceId))
      setRenameSaveState(serviceId, 'idle')
      return
    }

    try {
      setRenameSaveState(serviceId, 'saving')
      await updateService.mutateAsync({
        serviceId,
        name: normalized,
      })
      setRenameDrafts((prev) => removeDraftEntry(prev, serviceId))
      markRenameSaved(serviceId)
    } catch (error) {
      setRenameSaveState(serviceId, 'error')
      showSettingsInfo(
        'Unable to rename service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handlePriceBlur = async (
    serviceId: number,
    currentDefaultPriceCents: number | null
  ) => {
    const draft = priceDrafts[serviceId]
    if (draft === undefined) {
      setPriceSaveState(serviceId, 'idle')
      return
    }

    const parsed = parsePriceInputToCents(draft)
    if (parsed === undefined) {
      showSettingsInfo(
        'Invalid price',
        'Use a valid amount like 95 or 95.50, or leave blank.'
      )
      setPriceDrafts((prev) => ({
        ...prev,
        [serviceId]: formatPriceInput(currentDefaultPriceCents),
      }))
      setPriceSaveState(serviceId, 'error')
      return
    }

    if (parsed === currentDefaultPriceCents) {
      setPriceDrafts((prev) => removeDraftEntry(prev, serviceId))
      setPriceSaveState(serviceId, 'idle')
      return
    }

    try {
      setPriceSaveState(serviceId, 'saving')
      await updateService.mutateAsync({
        serviceId,
        defaultPriceCents: parsed,
      })
      setPriceDrafts((prev) => removeDraftEntry(prev, serviceId))
      markPriceSaved(serviceId)
    } catch (error) {
      setPriceSaveState(serviceId, 'error')
      showSettingsInfo(
        'Unable to update price',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleMoveService = async (serviceId: number, direction: 'up' | 'down') => {
    const currentOrder = activeServices.map((service) => service.id)
    const currentIndex = currentOrder.indexOf(serviceId)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return

    const nextOrder = [...currentOrder]
    const [moved] = nextOrder.splice(currentIndex, 1)
    nextOrder.splice(targetIndex, 0, moved)

    const updates = buildServiceReorderUpdates(activeServices, serviceId, direction)
    if (updates.length === 0) return

    setOptimisticActiveOrder(nextOrder)
    setReorderPulseKeys((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] ?? 0) + 1,
    }))

    try {
      await Promise.all(updates.map((update) => updateService.mutateAsync(update)))
    } catch (error) {
      setOptimisticActiveOrder(null)
      showSettingsInfo(
        'Unable to reorder services',
        error instanceof Error ? error.message : 'Please try again.'
      )
      return
    }

    setOptimisticActiveOrder(null)
  }

  const deleteService = async (serviceId: number) => {
    try {
      await permanentlyDeleteService.mutateAsync(serviceId)
    } catch (error) {
      showSettingsInfo(
        'Unable to delete service',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handlePermanentlyDeleteService = (
    serviceId: number,
    serviceName: string,
    usageCount: number
  ) => {
    if (usageCount > 0) {
      showSettingsInfo(
        'Service in use',
        `${serviceName} is used in ${usageCount} appointment log${usageCount === 1 ? '' : 's'} and cannot be permanently deleted.`
      )
      return
    }

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm(`Delete ${serviceName} permanently?\n\nThis cannot be undone.`)
      if (!confirmed) return
      void deleteService(serviceId)
      return
    }

    Alert.alert(
      'Delete permanently?',
      `${serviceName} will be removed permanently. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteService(serviceId)
          },
        },
      ]
    )
  }

  return {
    activeServices,
    canAddService,
    formatPriceInput,
    handleAddService,
    handleDeactivateService,
    handleMoveService,
    handlePermanentlyDeleteService,
    handleRenameDraftChange,
    handlePriceDraftChange,
    handlePriceBlur,
    handleReactivateService,
    handleRenameService,
    inactiveServices,
    isCreatingService: createService.isPending,
    isDeletingService: permanentlyDeleteService.isPending,
    priceDrafts,
    priceSaveStates,
    reorderPulseKeys,
    renameDrafts,
    renameSaveStates,
    serviceDraft,
    servicePriceDraft,
    setPriceDrafts,
    setRenameDrafts,
    setServiceDraft,
    setServicePriceDraft,
  }
}
