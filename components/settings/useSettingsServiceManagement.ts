import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Keyboard, Platform } from 'react-native'
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
  formatReturnWeeksInput,
  parsePriceInputToCents,
  parseReturnWeeksInput,
  removeDraftEntry,
  sortActiveServices,
  sortInactiveServices,
} from './settingsModelUtils'
import {
  buildServiceReorderUpdates,
  hasServiceNameConflict,
} from './settingsServiceManagementUtils'

type ServiceKeyboardField =
  | `rename:${number}`
  | `price:${number}`
  | `return:${number}`
  | 'new-service-name'
  | 'new-service-price'
  | 'new-service-return'

type ClientGroupKeyboardField = `client-group:${number}` | 'new-client-group'
type SettingsKeyboardField = ServiceKeyboardField | ClientGroupKeyboardField

type FocusableField = { focus?: () => void } | null

const FOCUS_SCROLL_TOLERANCE = 24
const IOS_KEYBOARD_SETTLE_DELAY_MS = 72
const ANDROID_KEYBOARD_SETTLE_DELAY_MS = 48

const ADD_SERVICE_FIELDS: ServiceKeyboardField[] = [
  'new-service-name',
  'new-service-price',
  'new-service-return',
]
const ADD_CLIENT_GROUP_FIELD: ClientGroupKeyboardField = 'new-client-group'

function buildServiceFieldId(
  kind: 'rename' | 'price' | 'return',
  serviceId: number
): ServiceKeyboardField {
  return `${kind}:${serviceId}` as ServiceKeyboardField
}

function buildClientGroupFieldId(groupId: number): ClientGroupKeyboardField {
  return `client-group:${groupId}` as ClientGroupKeyboardField
}

function isServiceField(field: SettingsKeyboardField): field is ServiceKeyboardField {
  return (
    field.startsWith('rename:') ||
    field.startsWith('price:') ||
    field.startsWith('return:') ||
    ADD_SERVICE_FIELDS.includes(field as ServiceKeyboardField)
  )
}

function isAddServiceField(field: SettingsKeyboardField) {
  return ADD_SERVICE_FIELDS.includes(field as ServiceKeyboardField)
}

function isClientGroupField(field: SettingsKeyboardField): field is ClientGroupKeyboardField {
  return field === ADD_CLIENT_GROUP_FIELD || field.startsWith('client-group:')
}

function resolveServiceFieldParts(field: SettingsKeyboardField) {
  if (!isServiceField(field) || isAddServiceField(field)) {
    return null
  }

  const [kind, id] = field.split(':')
  return {
    kind: kind as 'rename' | 'price' | 'return',
    serviceId: Number(id),
  }
}

export function useSettingsServiceManagement({
  activeClientGroupIds = [],
}: {
  activeClientGroupIds?: number[]
} = {}) {
  const toast = useToastController()
  const [serviceDraft, setServiceDraft] = useState('')
  const [servicePriceDraft, setServicePriceDraft] = useState('')
  const [serviceReturnWeeksDraft, setServiceReturnWeeksDraft] = useState('')
  const [optimisticActiveOrder, setOptimisticActiveOrder] = useState<number[] | null>(null)
  const [reorderPulseKeys, setReorderPulseKeys] = useState<Record<number, number>>({})
  const [renameDrafts, setRenameDrafts] = useState<Record<number, string>>({})
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({})
  const [returnWeeksDrafts, setReturnWeeksDrafts] = useState<Record<number, string>>({})
  const [renameSaveStates, setRenameSaveStates] = useState<
    Record<number, 'idle' | 'editing' | 'saving' | 'saved' | 'error'>
  >({})
  const [priceSaveStates, setPriceSaveStates] = useState<
    Record<number, 'idle' | 'editing' | 'saving' | 'saved' | 'error'>
  >({})
  const [returnWeeksSaveStates, setReturnWeeksSaveStates] = useState<
    Record<number, 'idle' | 'editing' | 'saving' | 'saved' | 'error'>
  >({})
  const renameSaveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const priceSaveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const returnWeeksSaveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const settingsScrollRef = useRef<any>(null)
  const settingsScrollY = useRef(0)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardVisible = useRef(false)
  const activeServicesSectionY = useRef<number | null>(null)
  const addServiceSectionY = useRef<number | null>(null)
  const clientGroupsSectionY = useRef<number | null>(null)
  const activeClientGroupsListY = useRef<number | null>(null)
  const addClientGroupRowY = useRef<number | null>(null)
  const activeServiceCardY = useRef<Record<number, number>>({})
  const activeClientGroupCardY = useRef<Record<number, number>>({})
  const fieldY = useRef<Partial<Record<SettingsKeyboardField, number>>>({})
  const activeField = useRef<SettingsKeyboardField | null>(null)
  const inputRefs = useRef<Partial<Record<SettingsKeyboardField, FocusableField>>>({})
  const [activeKeyboardField, setActiveKeyboardField] =
    useState<SettingsKeyboardField | null>(null)

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
  const keyboardFields = useMemo<SettingsKeyboardField[]>(
    () => [
      ...activeServices.flatMap((service) => [
        buildServiceFieldId('rename', service.id),
        buildServiceFieldId('price', service.id),
        buildServiceFieldId('return', service.id),
      ]),
      ...ADD_SERVICE_FIELDS,
      ...activeClientGroupIds.map((id) => buildClientGroupFieldId(id)),
      ADD_CLIENT_GROUP_FIELD,
    ],
    [activeClientGroupIds, activeServices]
  )

  const clearPendingScroll = useCallback(() => {
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
  }, [])

  const setFocusedKeyboardField = useCallback((field: SettingsKeyboardField | null) => {
    activeField.current = field
    setActiveKeyboardField(field)
  }, [])

  const resolveFieldTarget = useCallback((field: SettingsKeyboardField) => {
    const localFieldY = fieldY.current[field]
    if (typeof localFieldY !== 'number') {
      return undefined
    }

    if (field === ADD_CLIENT_GROUP_FIELD) {
      const sectionY = clientGroupsSectionY.current
      const rowY = addClientGroupRowY.current
      if (typeof sectionY !== 'number' || typeof rowY !== 'number') {
        return undefined
      }
      return sectionY + rowY + localFieldY
    }

    if (isClientGroupField(field)) {
      const sectionY = clientGroupsSectionY.current
      const listY = activeClientGroupsListY.current
      const groupId = Number(field.split(':')[1])
      const cardY = activeClientGroupCardY.current[groupId]
      if (
        typeof sectionY !== 'number' ||
        typeof listY !== 'number' ||
        typeof cardY !== 'number'
      ) {
        return undefined
      }
      return sectionY + listY + cardY + localFieldY
    }

    if (isAddServiceField(field)) {
      const sectionY = addServiceSectionY.current
      if (typeof sectionY !== 'number') {
        return undefined
      }
      return sectionY + localFieldY
    }

    const fieldParts = resolveServiceFieldParts(field)
    if (!fieldParts) {
      return undefined
    }

    const sectionY = activeServicesSectionY.current
    const cardY = activeServiceCardY.current[fieldParts.serviceId]
    if (typeof sectionY !== 'number' || typeof cardY !== 'number') {
      return undefined
    }

    return sectionY + cardY + localFieldY
  }, [])

  const getFocusOffset = useCallback((field: SettingsKeyboardField) => {
    if (field.startsWith('rename:')) {
      return Platform.OS === 'ios' ? 70 : 58
    }
    if (isClientGroupField(field)) {
      return Platform.OS === 'ios' ? 96 : 84
    }
    return Platform.OS === 'ios' ? 88 : 76
  }, [])

  const scrollFocusedFieldIntoView = useCallback(
    (field: SettingsKeyboardField, options?: { delayMs?: number }) => {
      const targetY = resolveFieldTarget(field)
      if (typeof targetY !== 'number') return

      clearPendingScroll()
      const delay =
        options?.delayMs ??
        (keyboardVisible.current
          ? Platform.OS === 'ios'
            ? 12
            : 20
          : Platform.OS === 'ios'
            ? 72
            : 36)

      scrollTimeoutRef.current = setTimeout(() => {
        const nextScrollY = Math.max(0, targetY - getFocusOffset(field))

        if (Math.abs(settingsScrollY.current - nextScrollY) < FOCUS_SCROLL_TOLERANCE) {
          scrollTimeoutRef.current = null
          return
        }

        settingsScrollRef.current?.scrollTo({
          y: nextScrollY,
          animated: true,
        })
        scrollTimeoutRef.current = null
      }, delay)
    },
    [clearPendingScroll, getFocusOffset, resolveFieldTarget]
  )

  const setServiceInputRef = useCallback(
    (field: SettingsKeyboardField) => (instance: FocusableField) => {
      inputRefs.current[field] = instance
    },
    []
  )

  const focusKeyboardField = useCallback((field: SettingsKeyboardField) => {
    inputRefs.current[field]?.focus?.()
  }, [])

  const handleServiceFieldFocus = useCallback(
    (field: SettingsKeyboardField) => {
      setFocusedKeyboardField(field)
      if (keyboardVisible.current) {
        scrollFocusedFieldIntoView(field, { delayMs: 20 })
      }
    },
    [scrollFocusedFieldIntoView, setFocusedKeyboardField]
  )

  const focusAdjacentKeyboardField = useCallback(
    (direction: 'previous' | 'next') => {
      const currentField = activeField.current ?? activeKeyboardField
      if (!currentField) return

      const currentIndex = keyboardFields.indexOf(currentField)
      if (currentIndex === -1) return

      const step = direction === 'previous' ? -1 : 1
      let nextIndex = currentIndex + step
      let targetField = keyboardFields[nextIndex]
      while (targetField && !inputRefs.current[targetField]?.focus) {
        nextIndex += step
        targetField = keyboardFields[nextIndex]
      }
      if (!targetField) return

      setFocusedKeyboardField(targetField)
      setTimeout(() => {
        focusKeyboardField(targetField)
        if (keyboardVisible.current) {
          scrollFocusedFieldIntoView(targetField, { delayMs: 20 })
        }
      }, 0)
    },
    [activeKeyboardField, focusKeyboardField, keyboardFields, scrollFocusedFieldIntoView, setFocusedKeyboardField]
  )

  const handleServiceFieldSubmit = useCallback(
    (field: SettingsKeyboardField) => {
      const mountedFields = keyboardFields.filter((item) => inputRefs.current[item]?.focus)
      const currentIndex = mountedFields.indexOf(field)
      if (currentIndex === -1) return

      if (currentIndex >= mountedFields.length - 1) {
        setFocusedKeyboardField(null)
        Keyboard.dismiss()
        return
      }

      focusAdjacentKeyboardField('next')
    },
    [focusAdjacentKeyboardField, keyboardFields, setFocusedKeyboardField]
  )

  const getServiceFieldReturnKeyType = useCallback(
    (field: SettingsKeyboardField) => {
      const mountedFields = keyboardFields.filter((item) => inputRefs.current[item]?.focus)
      const fields = mountedFields.length ? mountedFields : keyboardFields
      return fields[fields.length - 1] === field ? 'done' : 'next'
    },
    [keyboardFields]
  )

  useEffect(() => {
    const renameTimers = renameSaveTimers.current
    const priceTimers = priceSaveTimers.current
    const returnWeeksTimers = returnWeeksSaveTimers.current

    return () => {
      Object.values(renameTimers).forEach((timer) => clearTimeout(timer))
      Object.values(priceTimers).forEach((timer) => clearTimeout(timer))
      Object.values(returnWeeksTimers).forEach((timer) => clearTimeout(timer))
      clearPendingScroll()
    }
  }, [clearPendingScroll])

  useEffect(() => {
    const activeIds = new Set(activeServices.map((service) => service.id))
    if (!activeField.current) {
      return
    }

    const fieldParts = resolveServiceFieldParts(activeField.current)
    if (fieldParts && !activeIds.has(fieldParts.serviceId)) {
      setFocusedKeyboardField(null)
    }
  }, [activeServices, setFocusedKeyboardField])

  useEffect(() => {
    const handleKeyboardShow = () => {
      keyboardVisible.current = true
      if (activeField.current) {
        scrollFocusedFieldIntoView(activeField.current, {
          delayMs: Platform.OS === 'ios'
            ? IOS_KEYBOARD_SETTLE_DELAY_MS
            : ANDROID_KEYBOARD_SETTLE_DELAY_MS,
        })
      }
    }

    const handleKeyboardHide = () => {
      keyboardVisible.current = false
      setFocusedKeyboardField(null)
      clearPendingScroll()
    }

    const showSub = Keyboard.addListener('keyboardDidShow', handleKeyboardShow)
    const hideSub = Keyboard.addListener('keyboardDidHide', handleKeyboardHide)

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [clearPendingScroll, scrollFocusedFieldIntoView, setFocusedKeyboardField])

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

  const clearReturnWeeksSaveTimer = (serviceId: number) => {
    const timer = returnWeeksSaveTimers.current[serviceId]
    if (!timer) return
    clearTimeout(timer)
    delete returnWeeksSaveTimers.current[serviceId]
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

  const setReturnWeeksSaveState = (
    serviceId: number,
    state: 'idle' | 'editing' | 'saving' | 'saved' | 'error'
  ) => {
    clearReturnWeeksSaveTimer(serviceId)
    setReturnWeeksSaveStates((prev) => {
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

  const markReturnWeeksSaved = (serviceId: number) => {
    setReturnWeeksSaveState(serviceId, 'saved')
    returnWeeksSaveTimers.current[serviceId] = setTimeout(() => {
      setReturnWeeksSaveStates((prev) => {
        if (prev[serviceId] !== 'saved') return prev
        const next = { ...prev }
        delete next[serviceId]
        return next
      })
      delete returnWeeksSaveTimers.current[serviceId]
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

  const handleReturnWeeksDraftChange = (serviceId: number, text: string) => {
    setReturnWeeksDrafts((prev) => ({
      ...prev,
      [serviceId]: text,
    }))
    setReturnWeeksSaveState(serviceId, 'editing')
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

    if (parseReturnWeeksInput(serviceReturnWeeksDraft) === undefined) {
      showSettingsInfo(
        'Invalid return cadence',
        'Use a whole number of weeks between 1 and 52, or leave blank.'
      )
      return
    }
    const resolvedDefaultReturnWeeks = parseReturnWeeksInput(serviceReturnWeeksDraft)

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
        defaultReturnWeeks: resolvedDefaultReturnWeeks,
      })
      setFocusedKeyboardField(null)
      Keyboard.dismiss()
      clearPendingScroll()
      setServiceDraft('')
      setServicePriceDraft('')
      setServiceReturnWeeksDraft('')
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

  const handleReturnWeeksBlur = async (
    serviceId: number,
    currentDefaultReturnWeeks: number | null
  ) => {
    const draft = returnWeeksDrafts[serviceId]
    if (draft === undefined) {
      setReturnWeeksSaveState(serviceId, 'idle')
      return
    }

    const parsed = parseReturnWeeksInput(draft)
    if (parsed === undefined) {
      showSettingsInfo(
        'Invalid return cadence',
        'Use a whole number of weeks between 1 and 52, or leave blank.'
      )
      setReturnWeeksDrafts((prev) => ({
        ...prev,
        [serviceId]: formatReturnWeeksInput(currentDefaultReturnWeeks),
      }))
      setReturnWeeksSaveState(serviceId, 'error')
      return
    }

    if (parsed === currentDefaultReturnWeeks) {
      setReturnWeeksDrafts((prev) => removeDraftEntry(prev, serviceId))
      setReturnWeeksSaveState(serviceId, 'idle')
      return
    }

    try {
      setReturnWeeksSaveState(serviceId, 'saving')
      await updateService.mutateAsync({
        serviceId,
        defaultReturnWeeks: parsed,
      })
      setReturnWeeksDrafts((prev) => removeDraftEntry(prev, serviceId))
      markReturnWeeksSaved(serviceId)
    } catch (error) {
      setReturnWeeksSaveState(serviceId, 'error')
      showSettingsInfo(
        'Unable to update return cadence',
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

  const handleServicesScreenScroll = useCallback((event: {
    nativeEvent: { contentOffset: { y: number } }
  }) => {
    settingsScrollY.current = event.nativeEvent.contentOffset.y
  }, [])

  const handleServicesScreenScrollBeginDrag = useCallback(() => {
    setFocusedKeyboardField(null)
    Keyboard.dismiss()
    clearPendingScroll()
  }, [clearPendingScroll, setFocusedKeyboardField])

  const handleActiveServicesSectionLayout = useCallback((y: number) => {
    activeServicesSectionY.current = y
  }, [])

  const handleAddServiceSectionLayout = useCallback((y: number) => {
    addServiceSectionY.current = y
  }, [])

  const handleClientGroupsSectionLayout = useCallback((y: number) => {
    clientGroupsSectionY.current = y
  }, [])

  const handleActiveClientGroupsListLayout = useCallback((y: number) => {
    activeClientGroupsListY.current = y
  }, [])

  const handleClientGroupCardLayout = useCallback((groupId: number, y: number) => {
    activeClientGroupCardY.current[groupId] = y
  }, [])

  const handleAddClientGroupRowLayout = useCallback((y: number) => {
    addClientGroupRowY.current = y
  }, [])

  const handleActiveServiceCardLayout = useCallback((serviceId: number, y: number) => {
    activeServiceCardY.current[serviceId] = y
  }, [])

  const handleServiceFieldLayout = useCallback((field: SettingsKeyboardField, y: number) => {
    fieldY.current[field] = y
  }, [])

  const mountedKeyboardFields = keyboardFields.filter((field) => inputRefs.current[field]?.focus)
  const activeKeyboardFieldIndex = activeKeyboardField
    ? (mountedKeyboardFields.length ? mountedKeyboardFields : keyboardFields).indexOf(activeKeyboardField)
    : -1
  const canGoToPreviousServiceField = activeKeyboardFieldIndex > 0
  const canGoToNextServiceField =
    activeKeyboardFieldIndex >= 0 &&
    activeKeyboardFieldIndex <
      (mountedKeyboardFields.length ? mountedKeyboardFields : keyboardFields).length - 1

  return {
    activeServices,
    canAddService,
    canGoToNextServiceField,
    canGoToPreviousServiceField,
    formatPriceInput,
    formatReturnWeeksInput,
    handleAddService,
    handleActiveServiceCardLayout,
    handleActiveServicesSectionLayout,
    handleAddServiceSectionLayout,
    handleActiveClientGroupsListLayout,
    handleAddClientGroupRowLayout,
    handleClientGroupCardLayout,
    handleClientGroupFieldFocus: handleServiceFieldFocus,
    handleClientGroupFieldLayout: handleServiceFieldLayout,
    handleClientGroupFieldSubmit: handleServiceFieldSubmit,
    handleClientGroupsSectionLayout,
    handleDeactivateService,
    handleServiceFieldFocus,
    handleServiceFieldLayout,
    handleServiceFieldSubmit,
    handleServicesScreenScroll,
    handleServicesScreenScrollBeginDrag,
    handleMoveService,
    handlePermanentlyDeleteService,
    handleRenameDraftChange,
    handlePriceDraftChange,
    handlePriceBlur,
    handleReturnWeeksBlur,
    handleReactivateService,
    handleRenameService,
    handleReturnWeeksDraftChange,
    focusAdjacentKeyboardField,
    getServiceFieldReturnKeyType,
    getClientGroupFieldReturnKeyType: getServiceFieldReturnKeyType,
    inactiveServices,
    isCreatingService: createService.isPending,
    isDeletingService: permanentlyDeleteService.isPending,
    keyboardAccessoryId: 'settings-services-keyboard-dismiss',
    keyboardDismissMode:
      Platform.OS === 'ios' ? ('interactive' as const) : ('on-drag' as const),
    priceDrafts,
    priceSaveStates,
    returnWeeksDrafts,
    returnWeeksSaveStates,
    reorderPulseKeys,
    renameDrafts,
    renameSaveStates,
    setServiceInputRef,
    setClientGroupInputRef: setServiceInputRef,
    settingsScrollRef,
    serviceDraft,
    servicePriceDraft,
    serviceReturnWeeksDraft,
    setPriceDrafts,
    setRenameDrafts,
    setReturnWeeksDrafts,
    setServiceDraft,
    setServicePriceDraft,
    setServiceReturnWeeksDraft,
  }
}
