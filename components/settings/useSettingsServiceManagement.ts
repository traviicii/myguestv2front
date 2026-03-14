import { useMemo, useState } from 'react'
import { Alert, Platform } from 'react-native'

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
  const [serviceDraft, setServiceDraft] = useState('')
  const [servicePriceDraft, setServicePriceDraft] = useState('')
  const [renameDrafts, setRenameDrafts] = useState<Record<number, string>>({})
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({})

  const { data: serviceCatalog = [] } = useServices('all')
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deactivateService = useDeactivateService()
  const permanentlyDeleteService = usePermanentlyDeleteService()
  const reactivateService = useReactivateService()

  const activeServices = useMemo(
    () => sortActiveServices(serviceCatalog),
    [serviceCatalog]
  )

  const inactiveServices = useMemo(
    () => sortInactiveServices(serviceCatalog),
    [serviceCatalog]
  )

  const canAddService = Boolean(normalizeServiceName(serviceDraft))

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
    if (draft === undefined) return

    const normalized = normalizeServiceName(draft)
    if (!normalized) {
      setRenameDrafts((prev) => ({ ...prev, [serviceId]: currentName }))
      return
    }

    if (normalized === currentName) {
      setRenameDrafts((prev) => removeDraftEntry(prev, serviceId))
      return
    }

    try {
      await updateService.mutateAsync({
        serviceId,
        name: normalized,
      })
      setRenameDrafts((prev) => removeDraftEntry(prev, serviceId))
    } catch (error) {
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
    if (draft === undefined) return

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
      return
    }

    if (parsed === currentDefaultPriceCents) {
      setPriceDrafts((prev) => removeDraftEntry(prev, serviceId))
      return
    }

    try {
      await updateService.mutateAsync({
        serviceId,
        defaultPriceCents: parsed,
      })
      setPriceDrafts((prev) => removeDraftEntry(prev, serviceId))
    } catch (error) {
      showSettingsInfo(
        'Unable to update price',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
  }

  const handleMoveService = async (serviceId: number, direction: 'up' | 'down') => {
    const updates = buildServiceReorderUpdates(activeServices, serviceId, direction)
    if (updates.length === 0) return

    try {
      for (const update of updates) {
        await updateService.mutateAsync(update)
      }
    } catch (error) {
      showSettingsInfo(
        'Unable to reorder services',
        error instanceof Error ? error.message : 'Please try again.'
      )
    }
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
    handlePriceBlur,
    handleReactivateService,
    handleRenameService,
    inactiveServices,
    isCreatingService: createService.isPending,
    isDeletingService: permanentlyDeleteService.isPending,
    priceDrafts,
    renameDrafts,
    serviceDraft,
    servicePriceDraft,
    setPriceDrafts,
    setRenameDrafts,
    setServiceDraft,
    setServicePriceDraft,
  }
}
