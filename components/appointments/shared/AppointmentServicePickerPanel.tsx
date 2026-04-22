import { useMemo, useState } from 'react'
import { Plus } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { useCreateService, useReactivateService } from 'components/data/queries'
import type { ServiceOption } from 'components/data/api/services'
import {
  FieldLabel,
  GhostButton,
  IOSBottomSheet,
  PrimaryButton,
  SecondaryButton,
  TextField,
} from 'components/ui/controls'
import { normalizeServiceName } from 'components/utils/services'

import { AppointmentServicePickerOptions } from './AppointmentServicePickerOptions'
import type { AppointmentInteractiveUiState } from './useAppointmentInteractiveUi'

type AppointmentServicePickerPanelProps = {
  servicePanel: AppointmentInteractiveUiState['servicePanel']
  services: ServiceOption[]
  allServices: ServiceOption[]
  selectedServiceIds: number[]
  onDismiss: () => void
  onClear: () => void
  onSelectService: (serviceId: number) => void
  onToggleService: (serviceId: number) => void
}

type InlineServiceCreateProps = Pick<
  AppointmentServicePickerPanelProps,
  'allServices' | 'onSelectService'
> & {
  autoFocus?: boolean
  draft: string
  errorMessage: string | null
  isExpanded: boolean
  onCancel: () => void
  onChangeDraft: (value: string) => void
  onExpand: () => void
}

function InlineServiceCreate({
  allServices,
  autoFocus = false,
  draft,
  errorMessage,
  isExpanded,
  onCancel,
  onChangeDraft,
  onExpand,
  onSelectService,
}: InlineServiceCreateProps) {
  const createService = useCreateService()
  const reactivateService = useReactivateService()

  const normalizedDraft = useMemo(() => normalizeServiceName(draft), [draft])
  const existingService = useMemo(() => {
    const key = normalizedDraft.trim().toLowerCase()
    if (!key) return null
    return allServices.find((service) => service.normalizedName === key) ?? null
  }, [allServices, normalizedDraft])

  const handleCreateOrSelect = async () => {
    if (!normalizedDraft) return

    if (existingService?.isActive) {
      onSelectService(existingService.id)
      onCancel()
      return
    }

    try {
      if (existingService && !existingService.isActive) {
        const reactivated = await reactivateService.mutateAsync(existingService.id)
        onSelectService(reactivated.id)
        onCancel()
        return
      }

      const created = await createService.mutateAsync({ name: normalizedDraft })
      onSelectService(created.id)
      onCancel()
    } catch {
      // Error state is handled by the shared parent so both measured/visible
      // panel copies stay in sync height-wise.
    }
  }

  const actionLabel = existingService
    ? existingService.isActive
      ? 'Select Existing'
      : 'Reactivate Service'
    : 'Create'

  const isSubmitting = createService.isPending || reactivateService.isPending
  const canSubmit = Boolean(normalizedDraft) && !isSubmitting

  if (!isExpanded) {
    return (
      <GhostButton icon={<Plus size={14} />} onPress={onExpand}>
        Add new service
      </GhostButton>
    )
  }

  return (
    <YStack gap="$2.5" pt="$2">
      <YStack gap="$1.5">
        <FieldLabel>Add service</FieldLabel>
        <TextField
          autoFocus={autoFocus}
          placeholder="ex: single process"
          value={draft}
          onChangeText={onChangeDraft}
          onBlur={() => {
            onChangeDraft(normalizeServiceName(draft))
          }}
          onSubmitEditing={() => {
            void handleCreateOrSelect()
          }}
          returnKeyType="done"
        />
        {normalizedDraft ? (
          <Text fontSize={11} color="$textSecondary">
            {existingService?.isActive
              ? `Already in your catalog as ${existingService.name}.`
              : existingService
                ? `Reactivate ${existingService.name} and add it to this appointment.`
                : `Will appear as ${normalizedDraft}.`}
          </Text>
        ) : null}
        {errorMessage ? (
          <Text fontSize={11} color="$red10">
            {errorMessage}
          </Text>
        ) : null}
        <Text fontSize={11} color="$textSecondary">
          You can set a default price later in Control Center {'>'} Services.
        </Text>
      </YStack>
      <XStack gap="$2">
        <SecondaryButton flex={1} onPress={onCancel}>
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

type AppointmentServicePickerCardProps = Omit<
  AppointmentServicePickerPanelProps,
  'onDismiss' | 'servicePanel'
> & {
  autoFocusComposer?: boolean
  composerDraft: string
  composerError: string | null
  isComposerExpanded: boolean
  onComposerCancel: () => void
  onComposerChangeDraft: (value: string) => void
  onComposerExpand: () => void
}

function AppointmentServicePickerCard({
  autoFocusComposer = false,
  composerDraft,
  composerError,
  isComposerExpanded,
  allServices,
  services,
  selectedServiceIds,
  onClear,
  onComposerCancel,
  onComposerChangeDraft,
  onComposerExpand,
  onSelectService,
  onToggleService,
}: AppointmentServicePickerCardProps) {
  const content = (
    <YStack gap="$3">
      <AppointmentServicePickerOptions
        services={services}
        selectedServiceIds={selectedServiceIds}
        onClear={onClear}
        onToggleService={onToggleService}
      />
      <InlineServiceCreate
        allServices={allServices}
        autoFocus={autoFocusComposer}
        draft={composerDraft}
        errorMessage={composerError}
        isExpanded={isComposerExpanded}
        onCancel={onComposerCancel}
        onChangeDraft={onComposerChangeDraft}
        onExpand={onComposerExpand}
        onSelectService={onSelectService}
      />
    </YStack>
  )

  return <YStack>{content}</YStack>
}

export function AppointmentServicePickerPanel({
  servicePanel,
  allServices,
  services,
  selectedServiceIds,
  onDismiss,
  onClear,
  onSelectService,
  onToggleService,
}: AppointmentServicePickerPanelProps) {
  const [isComposerExpanded, setIsComposerExpanded] = useState(false)
  const [composerDraft, setComposerDraft] = useState('')
  const [composerError, setComposerError] = useState<string | null>(null)

  if (!servicePanel.showPanel) {
    return null
  }

  const handleComposerCancel = () => {
    setComposerDraft('')
    setComposerError(null)
    setIsComposerExpanded(false)
  }

  const handleComposerChangeDraft = (value: string) => {
    setComposerDraft(value)
    if (composerError) {
      setComposerError(null)
    }
  }

  const handleComposerExpand = () => {
    setComposerError(null)
    setIsComposerExpanded(true)
  }

  return (
    <IOSBottomSheet
      open={servicePanel.showPanel}
      onClose={() => {
        handleComposerCancel()
        onDismiss()
      }}
      title="Services"
      testID="appointment-service-picker-sheet"
    >
      <AppointmentServicePickerCard
        autoFocusComposer={true}
        composerDraft={composerDraft}
        composerError={composerError}
        isComposerExpanded={isComposerExpanded}
        allServices={allServices}
        services={services}
        selectedServiceIds={selectedServiceIds}
        onClear={onClear}
        onComposerCancel={handleComposerCancel}
        onComposerChangeDraft={handleComposerChangeDraft}
        onComposerExpand={handleComposerExpand}
        onSelectService={onSelectService}
        onToggleService={onToggleService}
      />
    </IOSBottomSheet>
  )
}
