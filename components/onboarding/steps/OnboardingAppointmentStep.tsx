import { Text, XStack, YStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextField,
} from 'components/ui/controls'

import type { OnboardingSectionProps } from './sectionTypes'

export function OnboardingAppointmentStep({ model }: OnboardingSectionProps) {
  return (
    <YStack gap="$3">
      <Text fontSize={13} color="$textSecondary">
        Log the first appointment to see your dashboard metrics.
      </Text>
      <TextField
        placeholder="Date (MM/DD/YYYY)"
        value={model.appointmentDraft.date}
        onChangeText={(text) => model.setAppointmentDraft((prev) => ({ ...prev, date: text }))}
      />
      <Text fontSize={12} color="$textSecondary">
        Choose a preset service
      </Text>
      <XStack gap="$2" flexWrap="wrap">
        {model.serviceOptions.map((service) => (
          <OptionChip
            key={service.id}
            active={model.selectedServiceId === service.id}
            onPress={() => model.setSelectedServiceId(service.id)}
          >
            <OptionChipLabel active={model.selectedServiceId === service.id}>
              {service.name}
            </OptionChipLabel>
          </OptionChip>
        ))}
      </XStack>
      <TextField
        placeholder="Or add a new service"
        value={model.newServiceName}
        onChangeText={model.setNewServiceName}
      />
      <SecondaryButton onPress={() => void model.handleSaveNewService()}>
        Save as preset
      </SecondaryButton>
      <TextField
        placeholder="Price (optional)"
        keyboardType="decimal-pad"
        value={model.appointmentDraft.price}
        onChangeText={(text) => model.setAppointmentDraft((prev) => ({ ...prev, price: text }))}
      />
      <TextField
        placeholder="Notes (optional)"
        value={model.appointmentDraft.notes}
        onChangeText={(text) => model.setAppointmentDraft((prev) => ({ ...prev, notes: text }))}
      />
      <SurfaceCard tone={model.cardTone} p="$3" gap="$1.5">
        <Text fontSize={12} fontWeight="700" color="$textPrimary">
          Your data stays in your control
        </Text>
        <Text fontSize={11} color="$textSecondary">
          Export your records as CSV from Settings anytime, keep photos optional, and delete
          your account later if you ever need to leave.
        </Text>
      </SurfaceCard>
      <PrimaryButton disabled={model.isSaving} onPress={() => void model.handleFinish()}>
        {model.isSaving ? 'Saving...' : 'Save & Finish'}
      </PrimaryButton>
    </YStack>
  )
}
