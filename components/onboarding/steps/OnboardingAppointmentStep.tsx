import { Text, XStack, YStack } from 'tamagui'

import { AppointmentDatePickerField } from 'components/appointments/shared/AppointmentDatePickerField'
import {
  FieldLabel,
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
    <YStack gap="$3.5">
      <Text fontSize={13} color="$textSecondary">
        Your first client is ready. Logging one appointment now makes Overview immediately useful.
      </Text>
      <AppointmentDatePickerField
        datePanel={model.datePanel}
        displayValue={model.appointmentDraft.date}
        onDateChange={model.handleDateChange}
        onFieldPress={model.handleDateFieldPress}
        pickerDate={model.pickerDate}
        pulseKey={0}
        showDateError={false}
        showDatePicker={model.showDatePicker}
      />
      <FieldLabel>Service</FieldLabel>
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
      <YStack gap="$2.5">
        <PrimaryButton disabled={model.isSaving} onPress={() => void model.handleFinish()}>
          {model.isSaving ? 'Saving...' : 'Save & Finish'}
        </PrimaryButton>
        <SecondaryButton onPress={model.handleFinishWithoutAppointment}>
          Finish Without Appointment
        </SecondaryButton>
      </YStack>
    </YStack>
  )
}
