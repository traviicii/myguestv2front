import { ChevronDown } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { AppointmentDatePickerField } from 'components/appointments/shared/AppointmentDatePickerField'
import { AppointmentImagePreviewModal as SharedAppointmentImagePreviewModal } from 'components/appointments/shared/AppointmentImagePreviewModal'
import { AppointmentPhotoSection } from 'components/appointments/shared/AppointmentPhotoSection'
import { AppointmentServicePickerPanel } from 'components/appointments/shared/AppointmentServicePickerPanel'
import {
  CurrencyField,
  FieldLabel,
  InsetGroup,
  InsetSectionFooter,
  InsetSectionHeader,
  PrimaryButton,
  SecondaryButton,
  SectionDivider,
  TextAreaField,
} from 'components/ui/controls'

import type { EditAppointmentScreenModel } from './useEditAppointmentScreenModel'

type EditAppointmentSectionProps = {
  model: EditAppointmentScreenModel
}

export function AppointmentDetailsSection({ model }: EditAppointmentSectionProps) {
  return (
    <YStack gap="$3.5">
      <InsetSectionHeader
        title="Details"
        subtitle="Adjust the appointment date, services, price, and notes in a grouped flow."
      />
      <InsetGroup tone={model.cardTone}>
        <YStack
          px="$4"
          py="$3"
          gap="$2"
          onLayout={(event) => {
            model.requiredY.current.date = event.nativeEvent.layout.y
          }}
        >
          <FieldLabel>Date</FieldLabel>
          <AppointmentDatePickerField
            datePanel={model.datePanel}
            displayValue={model.form.date}
            fieldBackground="$surfaceField"
            onDateChange={model.handleDateChange}
            onFieldPress={model.handleDateFieldPress}
            onPickerDismiss={model.closeDatePicker}
            pickerDate={model.pickerDate}
            pulseKey={model.pulseKey}
            sheetTitle="Appointment Date"
            showDateError={model.showDateError}
            showDatePicker={model.showDatePicker}
          />
        </YStack>

        <SectionDivider />

        <YStack px="$4" py="$3" gap="$2">
          <FieldLabel>Services</FieldLabel>
          <YStack position="relative">
            <XStack
              height={44}
              px="$3"
              rounded="$4"
              borderWidth={1}
              borderColor={model.showServicePicker ? '$accent' : '$borderSubtle'}
              bg="$surfaceField"
              items="center"
              justify="space-between"
              onPress={model.handleServiceFieldPress}
            >
              <Text
                fontSize={14}
                color={model.selectedServices.length ? '$color' : '$textSecondary'}
              >
                {model.selectedServiceSummary}
              </Text>
              <ChevronDown size={16} color="$textSecondary" />
            </XStack>
          </YStack>
          <AppointmentServicePickerPanel
            servicePanel={model.servicePanel}
            services={model.pickerServices}
            allServices={model.serviceCatalog}
            selectedServiceIds={model.selectedServiceIds}
            onDismiss={model.closeServicePicker}
            onClear={model.clearSelectedServices}
            onSelectService={model.selectService}
            onToggleService={model.toggleServiceSelection}
          />
        </YStack>

        <SectionDivider />

        <YStack px="$4" py="$3" gap="$2">
          <FieldLabel>Price</FieldLabel>
          <CurrencyField
            placeholder="0.00"
            value={model.form.price}
            inputAccessoryViewID={model.keyboardAccessoryId}
            onFocus={model.closePickers}
            onChangeText={(text) => model.setForm((prev) => ({ ...prev, price: text }))}
          />
          {model.suggestedPriceCents !== null ? (
            <InsetSectionFooter>
              Suggested from services: ${model.formatPriceFromCents(model.suggestedPriceCents)}
            </InsetSectionFooter>
          ) : null}
        </YStack>

        <SectionDivider />

        <YStack px="$4" py="$3" gap="$2">
          <FieldLabel>Formula / Notes</FieldLabel>
          <TextAreaField
            placeholder="Color formula, technique, notes..."
            value={model.form.notes}
            inputAccessoryViewID={model.keyboardAccessoryId}
            onFocus={model.closePickers}
            onChangeText={(text) => model.setForm((prev) => ({ ...prev, notes: text }))}
          />
        </YStack>
      </InsetGroup>
    </YStack>
  )
}

export function AppointmentPhotosSection({ model }: EditAppointmentSectionProps) {
  return (
    <AppointmentPhotoSection
      title={
        <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
          Photos
        </Text>
      }
      cardMode={model.cardMode}
      cardTone={model.cardTone}
      images={model.images}
      onCapture={() => {
        model.dismissInteractiveUI()
        void model.handleCapture()
      }}
      onUpload={() => {
        model.dismissInteractiveUI()
        void model.handleUpload()
      }}
      onOpenPreview={model.setPreviewUri}
      onRemoveImage={model.removeImage}
      onSetCoverImage={model.setCoverImage}
    />
  )
}

export function AppointmentActionsRow({ model }: EditAppointmentSectionProps) {
  return (
    <XStack gap="$3">
      <SecondaryButton flex={1} onPress={model.handleBack}>
        Cancel
      </SecondaryButton>
      <PrimaryButton
        flex={1}
        onPress={() => {
          model.dismissInteractiveUI()
          void model.handleSave()
        }}
        disabled={!model.canSave}
        opacity={model.canSave ? 1 : 0.5}
      >
        {model.updateAppointmentLog.isPending ? 'Saving...' : 'Save'}
      </PrimaryButton>
    </XStack>
  )
}

export function AppointmentImagePreviewModal({ model }: EditAppointmentSectionProps) {
  return (
    <SharedAppointmentImagePreviewModal
      previewUri={model.previewUri}
      onClose={() => model.setPreviewUri(null)}
    />
  )
}
