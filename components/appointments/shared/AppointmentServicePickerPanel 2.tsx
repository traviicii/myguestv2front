import { useMemo, useState } from 'react'
import { Pressable } from 'react-native'
import { Plus } from '@tamagui/lucide-icons'
import Animated from 'react-native-reanimated'
import { Text, XStack, YStack } from 'tamagui'

import { useCreateService, useReactivateService } from 'components/data/queries'
import type { ServiceOption } from 'components/data/api/services'
import {
  FieldLabel,
  GhostButton,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextField,
} from 'components/ui/controls'
import { FALLBACK_COLORS } from 'components/utils/color'
import { normalizeServiceName } from 'components/utils/services'

import { AppointmentServicePickerOptions } from './AppointmentServicePickerOptions'
import type { AppointmentInteractiveUiState } from './useAppointmentInteractiveUi'

type AppointmentServicePickerPanelProps = {
  cardMode?: 'section' | 'panel' | 'alwaysCard'
  cardTone?: 'default' | 'secondary' | 'tabGlass'
  isGlass?: boolean
  servicePanel: AppointmentInteractiveUiState['servicePanel']
  services: ServiceOption[]
  allServices: ServiceOption[]
  selectedServiceIds: number[]
  onClear: () => void
  onSelectService: (serviceId: number) => void
  onToggleService: (serviceId: number) => void
  trapPress?: boolean
}

function InlineServiceCreate({
  allServices,
  onSelectService,
}: Pick<AppointmentServicePickerPanelProps, 'allServices' | 'onSelectService'>) {
  const createService = useCreateService()
  const reactivateService = useReactivateService()
  const [isExpanded, setIsExpanded] = useState(false)
  const [draft, setDraft] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const normalizedDraft = useMemo(() => normalizeServiceName(draft), [draft])
  const existingService = useMemo(() => {
    const key = normalizedDraft.trim().toLowerCase()
    if (!key) return null
    return allServices.find((service) => service.normalizedName === key) ?? null
  }, [allServices, normalizedDraft])

  const resetComposer = () => {
    setDraft('')
    setErrorMessage(null)
    setIsExpanded(false)
  }

  const handleCreateOrSelect = async () => {
    if (!normalizedDraft) return
    setErrorMessage(null)

    if (existingService?.isActive) {
      onSelectService(existingService.id)
      resetComposer()
      return
    }

    try {
      if (existingService && !existingService.isActive) {
        const reactivated = await reactivateService.mutateAsync(existingService.id)
        onSelectService(reactivated.id)
        resetComposer()
        return
      }

      const created = await createService.mutateAsync({ name: normalizedDraft })
      onSelectService(created.id)
      resetComposer()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to add that service right now. Please try again.'
      )
    }
  }

  const actionLabel = existingService
    ? existingService.isActive
      ? `Select "${existingService.name}"`
      : `Reactivate "${existingService.name}"`
    : `Create "${normalizedDraft || 'Service'}"`

  const isSubmitting = createService.isPending || reactivateService.isPending
  const canSubmit = Boolean(normalizedDraft) && !isSubmitting

  if (!isExpanded) {
    return (
      <GhostButton
        icon={<Plus size={14} />}
        onPress={() => setIsExpanded(true)}
      >
        Add new service
      </GhostButton>
    )
  }

  return (
    <YStack gap="$2.5" pt="$2">
      <YStack gap="$1.5">
        <FieldLabel>Add service</FieldLabel>
        <TextField
          placeholder="ex: single process"
          value={draft}
          onChangeText={(text) => {
            setDraft(text)
            if (errorMessage) setErrorMessage(null)
          }}
          onBlur={() => {
            setDraft((current) => normalizeServiceName(current))
          }}
          onSubmitEditing={() => {
            void handleCreateOrSelect()
          }}
          returnKeyType="done"
        />
        {normalizedDraft ? (
          <Text fontSize={11} color="$textSecondary">
            Will appear as {normalizedDraft}.
          </Text>
        ) : null}
        {errorMessage ? (
          <Text fontSize={11} color="$red10">
            {errorMessage}
          </Text>
        ) : null}
      </YStack>
      <XStack gap="$2">
        <SecondaryButton flex={1} onPress={resetComposer}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          flex={1}
          disabled={!canSubmit}
          opacity={canSubmit ? 1 : 0.5}
          onPress={() => {
            void handleCreateOrSelect()
          }}
        >
          {isSubmitting ? 'Saving...' : actionLabel}
        </PrimaryButton>
      </XStack>
    </YStack>
  )
}

function AppointmentServicePickerCard({
  cardMode,
  cardTone,
  isGlass = false,
  allServices,
  services,
  selectedServiceIds,
  onClear,
  onSelectService,
  onToggleService,
}: Omit<AppointmentServicePickerPanelProps, 'servicePanel' | 'trapPress'>) {
  if (isGlass) {
    return (
      <SurfaceCard mode={cardMode ?? 'alwaysCard'} tone={cardTone ?? 'secondary'} p="$2" gap="$0">
        <AppointmentServicePickerOptions
          services={services}
          selectedServiceIds={selectedServiceIds}
          onClear={onClear}
          onToggleService={onToggleService}
        />
        <InlineServiceCreate
          allServices={allServices}
          onSelectService={onSelectService}
        />
      </SurfaceCard>
    )
  }

  return (
    <YStack
      rounded="$4"
      borderWidth={1}
      borderColor="$borderSubtle"
      p="$2"
      bg="$background"
      shadowColor={FALLBACK_COLORS.shadowSoft}
      shadowRadius={14}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 6 }}
      elevation={2}
    >
      <AppointmentServicePickerOptions
        services={services}
        selectedServiceIds={selectedServiceIds}
        onClear={onClear}
        onToggleService={onToggleService}
      />
      <InlineServiceCreate
        allServices={allServices}
        onSelectService={onSelectService}
      />
    </YStack>
  )
}

export function AppointmentServicePickerPanel({
  cardMode,
  cardTone,
  isGlass,
  servicePanel,
  allServices,
  services,
  selectedServiceIds,
  onClear,
  onSelectService,
  onToggleService,
  trapPress = false,
}: AppointmentServicePickerPanelProps) {
  if (!servicePanel.showPanel) {
    return null
  }

  const card = (
    <AppointmentServicePickerCard
      cardMode={cardMode}
      cardTone={cardTone}
      isGlass={isGlass}
      allServices={allServices}
      services={services}
      selectedServiceIds={selectedServiceIds}
      onClear={onClear}
      onSelectService={onSelectService}
      onToggleService={onToggleService}
    />
  )

  const wrappedCard = trapPress ? (
    <Pressable
      onPress={(event) => {
        event.stopPropagation?.()
      }}
    >
      {card}
    </Pressable>
  ) : (
    card
  )

  return (
    <YStack position="relative">
      <YStack
        position="absolute"
        l={0}
        r={0}
        t={0}
        opacity={0}
        pointerEvents="none"
        onLayout={(event) => {
          servicePanel.setMeasured(event.nativeEvent.layout.height)
        }}
      >
        {card}
      </YStack>
      <Animated.View style={[{ overflow: 'hidden' }, servicePanel.animatedStyle]}>
        {wrappedCard}
      </Animated.View>
    </YStack>
  )
}
