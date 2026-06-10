import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  ScrollView as RNScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useThemePrefs } from 'components/ThemePrefs'
import { resolveAppointmentImageUris } from 'components/appointments/shared/appointmentImageResolver'
import { buildDurableAppointmentImageInputs } from 'components/appointments/shared/appointmentImageStorage'
import { useAppointmentDetail, useClients } from 'components/data/queries'
import { useUpdateAppointmentLog } from 'components/data/queries/appointments'
import { formatDateByStyle } from 'components/utils/date'
import { getAppointmentServiceLabels } from 'components/utils/services'
import { useStudioStore } from 'components/state/studioStore'

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index])

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
  const {
    mutateAsync: repairAppointmentImages,
    isPending: isRepairingAppointmentImages,
  } = useUpdateAppointmentLog()
  const appSettings = useStudioStore((state) => state.appSettings)

  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [showPreviewControls, setShowPreviewControls] = useState(true)
  const [previewWidth, setPreviewWidth] = useState(0)
  const previewScrollRef = useRef<RNScrollView | null>(null)
  const attemptedLocalImageRepairRef = useRef<Set<string>>(new Set())
  const controlsOpacity = useRef(new Animated.Value(1)).current

  const topInset = Math.max(insets.top + 8, 16)
  const isBootstrapping = (appointmentLoading || clientsLoading) && !appointment
  const isMissingAppointment = !isBootstrapping && !appointment
  const client = clients.find((item) => item.id === appointment?.clientId)
  const fallbackImages = useMemo(() => appointment?.images ?? [], [appointment?.images])
  const imageRefsSignature = useMemo(
    () =>
      JSON.stringify(
        appointment?.imageRefs?.map((image) => ({
          storageProvider: image.storageProvider,
          publicUrl: image.publicUrl,
          objectKey: image.objectKey,
          fileName: image.fileName,
        })) ?? []
      ),
    [appointment?.imageRefs]
  )
  const imageResolutionKey = `${appointment?.id ?? ''}|${imageRefsSignature}`
  const [resolvedImageState, setResolvedImageState] = useState<{
    images: string[]
    key: string
  }>({ images: [], key: '' })
  const images =
    resolvedImageState.key === imageResolutionKey
      ? resolvedImageState.images
      : fallbackImages
  const hasDeviceLocalImageRefs =
    appointment?.imageRefs?.some((image) => image.storageProvider === 'device_local') ?? false
  const canGoPrev = previewIndex !== null && previewIndex > 0
  const canGoNext = previewIndex !== null && previewIndex < images.length - 1
  const serviceLabels = appointment ? getAppointmentServiceLabels(appointment) : []
  const serviceLabel = serviceLabels[0] ?? ''
  const serviceCountLabel = serviceLabels.length
    ? `${serviceLabels.length} service${serviceLabels.length === 1 ? '' : 's'}`
    : 'No services'
  const formattedDate = appointment
    ? formatDateByStyle(appointment.date, appSettings.dateDisplayFormat, {
        todayLabel: true,
        includeWeekday: appSettings.dateLongIncludeWeekday,
      })
    : ''

  useEffect(() => {
    let isActive = true
    const imageRefs = appointment?.imageRefs ?? []
    const currentFallbackImages = appointment?.images ?? []

    setResolvedImageState((current) =>
      current.key === imageResolutionKey && arraysEqual(current.images, currentFallbackImages)
        ? current
        : { images: currentFallbackImages, key: imageResolutionKey }
    )

    if (!imageRefs.length) {
      return () => {
        isActive = false
      }
    }

    resolveAppointmentImageUris(imageRefs)
      .then((resolvedImages) => {
        if (!isActive) return
        const nextImages = resolvedImages.length ? resolvedImages : currentFallbackImages
        setResolvedImageState((current) =>
          current.key === imageResolutionKey && arraysEqual(current.images, nextImages)
            ? current
            : { images: nextImages, key: imageResolutionKey }
        )
      })
      .catch(() => {
        if (!isActive) return
        setResolvedImageState((current) =>
          current.key === imageResolutionKey && arraysEqual(current.images, currentFallbackImages)
            ? current
            : { images: currentFallbackImages, key: imageResolutionKey }
        )
      })

    return () => {
      isActive = false
    }
  }, [appointment?.imageRefs, appointment?.images, imageResolutionKey])

  useEffect(() => {
    if (
      !appointment ||
      !hasDeviceLocalImageRefs ||
      !fallbackImages.length ||
      isRepairingAppointmentImages ||
      attemptedLocalImageRepairRef.current.has(appointment.id)
    ) {
      return
    }

    attemptedLocalImageRepairRef.current.add(appointment.id)
    let isActive = true

    buildDurableAppointmentImageInputs({
      imageUris: fallbackImages,
      existingRefs: appointment.imageRefs ?? [],
    })
      .then((imageInputs) => {
        if (!isActive || !imageInputs.length) return
        return repairAppointmentImages({
          formulaId: appointment.id,
          images: imageInputs,
        })
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn(
            '[appointment-image-repair:failed]',
            appointment.id,
            error instanceof Error ? error.message : ''
          )
        }
      })

    return () => {
      isActive = false
    }
  }, [
    appointment,
    fallbackImages,
    hasDeviceLocalImageRefs,
    isRepairingAppointmentImages,
    repairAppointmentImages,
  ])

  useEffect(() => {
    if (!__DEV__ || !appointment) return
    console.log('[appointment-detail:images]', {
      appointmentId,
      imageCount: images.length,
      imageRefCount: appointment.imageRefs?.length ?? 0,
      imagePreview: images.map((uri) =>
        uri.length > 140 ? `${uri.slice(0, 140)}...` : uri
      ),
      imageRefs: appointment.imageRefs?.map((image) => ({
        storageProvider: image.storageProvider,
        hasPublicUrl: Boolean(image.publicUrl),
        hasObjectKey: Boolean(image.objectKey),
        fileName: image.fileName,
      })) ?? [],
    })
  }, [appointment, appointmentId, images])

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
    serviceCountLabel,
    serviceLabel,
    serviceLabels,
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
