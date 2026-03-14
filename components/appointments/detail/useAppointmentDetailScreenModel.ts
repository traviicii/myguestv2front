import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  ScrollView as RNScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import { useAppointmentDetail, useClients } from 'components/data/queries'
import { formatDateByStyle } from 'components/utils/date'
import { getServiceLabel } from 'components/utils/services'
import { useStudioStore } from 'components/state/studioStore'

export function useAppointmentDetailScreenModel() {
  const { aesthetic } = useThemePrefs()
  const isCyberpunk = aesthetic === 'cyberpunk'
  const isGlass = aesthetic === 'glass'
  const cardRadius = isCyberpunk ? 0 : isGlass ? 24 : 14
  const thumbRadius = isCyberpunk ? 0 : isGlass ? 14 : 8
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>()
  const appointmentId = typeof id === 'string' ? id : ''
  const hideViewClient = from === 'client'
  const { data: appointment, isLoading: appointmentLoading } = useAppointmentDetail(appointmentId)
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const appSettings = useStudioStore((state) => state.appSettings)

  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [showPreviewControls, setShowPreviewControls] = useState(true)
  const [previewWidth, setPreviewWidth] = useState(0)
  const previewScrollRef = useRef<RNScrollView | null>(null)
  const controlsOpacity = useRef(new Animated.Value(1)).current

  const topInset = Math.max(insets.top + 8, 16)
  const isBootstrapping = (appointmentLoading || clientsLoading) && !appointment
  const isMissingAppointment = !isBootstrapping && !appointment
  const client = clients.find((item) => item.id === appointment?.clientId)
  const images = appointment?.images ?? []
  const canGoPrev = previewIndex !== null && previewIndex > 0
  const canGoNext = previewIndex !== null && previewIndex < images.length - 1
  const serviceLabel = appointment ? getServiceLabel(appointment.services, appointment.notes) : ''
  const formattedDate = appointment
    ? formatDateByStyle(appointment.date, appSettings.dateDisplayFormat, {
        todayLabel: true,
        includeWeekday: appSettings.dateLongIncludeWeekday,
      })
    : ''

  const editHref = useMemo<Href | null>(
    () => (appointmentId ? { pathname: '/appointment/[id]/edit', params: { id: appointmentId } } : null),
    [appointmentId]
  )

  const viewClientHref = useMemo<Href | null>(
    () =>
      appointment?.clientId
        ? { pathname: '/client/[id]', params: { id: appointment.clientId } }
        : null,
    [appointment?.clientId]
  )

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      if (!previewWidth) return
      previewScrollRef.current?.scrollTo({
        x: index * previewWidth,
        animated,
      })
    },
    [previewWidth]
  )

  useEffect(() => {
    if (previewIndex === null || previewWidth === 0) return
    scrollToIndex(previewIndex, false)
  }, [previewIndex, previewWidth, scrollToIndex])

  useEffect(() => {
    if (previewIndex !== null) {
      setShowPreviewControls(true)
    }
  }, [previewIndex])

  useEffect(() => {
    Animated.timing(controlsOpacity, {
      toValue: showPreviewControls ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()
  }, [controlsOpacity, showPreviewControls])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleEdit = useCallback(() => {
    if (!editHref) return
    router.push(editHref)
  }, [editHref, router])

  const openPreview = useCallback((index: number) => {
    setPreviewIndex(index)
  }, [])

  const closePreview = useCallback(() => {
    setPreviewIndex(null)
  }, [])

  const handlePreviewLayout = useCallback((width: number) => {
    setPreviewWidth(width)
  }, [])

  const handlePreviewToggleControls = useCallback(() => {
    setShowPreviewControls((current) => !current)
  }, [])

  const handlePreviewScrollEnd = useCallback(
    (offsetX: number) => {
      if (!previewWidth) return
      const nextIndex = Math.round(offsetX / previewWidth)
      setPreviewIndex(nextIndex)
    },
    [previewWidth]
  )

  const goToPreviousPreview = useCallback(() => {
    if (!canGoPrev) return
    const nextIndex = Math.max(0, (previewIndex ?? 0) - 1)
    setPreviewIndex(nextIndex)
    scrollToIndex(nextIndex, true)
  }, [canGoPrev, previewIndex, scrollToIndex])

  const goToNextPreview = useCallback(() => {
    if (!canGoNext) return
    const nextIndex = Math.min(images.length - 1, (previewIndex ?? 0) + 1)
    setPreviewIndex(nextIndex)
    scrollToIndex(nextIndex, true)
  }, [canGoNext, images.length, previewIndex, scrollToIndex])

  return {
    appointment,
    appointmentId,
    canGoNext,
    canGoPrev,
    cardRadius,
    client,
    closePreview,
    controlsOpacity,
    editHref,
    formattedDate,
    handleBack,
    handleEdit,
    handlePreviewLayout,
    handlePreviewScrollEnd,
    handlePreviewToggleControls,
    hideViewClient,
    images,
    isBootstrapping,
    isCyberpunk,
    isGlass,
    isMissingAppointment,
    openPreview,
    previewIndex,
    previewScrollRef,
    previewWidth,
    serviceLabel,
    setPreviewIndex,
    showPreviewControls,
    thumbRadius,
    topInset,
    viewClientHref,
    goToNextPreview,
    goToPreviousPreview,
  }
}

export type AppointmentDetailScreenModel = ReturnType<typeof useAppointmentDetailScreenModel>
