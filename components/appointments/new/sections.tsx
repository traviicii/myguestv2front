import { Pressable } from 'react-native'
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
  SectionDivider,
  TextAreaField,
  ThemedEyebrowText,
  ThemedHeadingText,
} from 'components/ui/controls'

import type { NewAppointmentScreenModel } from './useNewAppointmentScreenModel'

type NewAppointmentSectionProps = {
  model: NewAppointmentScreenModel
}

export function NewAppointmentHeader({ model }: NewAppointmentSectionProps) {
  return (
    <YStack gap="$1">
      <ThemedEyebrowText>NEW APPOINTMENT LOG</ThemedEyebrowText>
      <ThemedHeadingText fontSize={20} fontWeight="700">
        {model.client?.name ?? 'Client'}
      </ThemedHeadingText>
    </YStack>
  )
}

export function NewAppointmentDetailsSection({ model }: NewAppointmentSectionProps) {
  return (
    <YStack gap="$3.5">
      <InsetSectionHeader
        title="Details"
        subtitle="Capture the date, services, price, and formula notes in one grouped flow."
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
            <Pressable
              onPress={(event) => {
                event.stopPropagation?.()
                model.handleServiceFieldPress()
              }}
            >
              <XStack
                height={44}
                px="$3"
                rounded="$4"
                borderWidth={1}
                borderColor={model.showServicePicker ? '$accent' : '$borderSubtle'}
                bg="$surfaceField"
                items="center"
                justify="space-between"
              >
                <Text
                  fontSize={14}
                  color={model.selectedServices.length ? '$color' : '$textSecondary'}
                >
                  {model.selectedServiceSummary}
                </Text>
                <ChevronDown size={16} color="$textSecondary" />
              </XStack>
            </Pressable>
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
            onChangeText={(text) => {
              model.setPriceEdited(true)
              model.setForm((prev) => ({ ...prev, price: text }))
            }}
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

export function NewAppointmentPhotosSection({ model }: NewAppointmentSectionProps) {
  return (
    <AppointmentPhotoSection
      title={
        <ThemedHeadingText fontWeight="700" fontSize={14}>
          Photos
        </ThemedHeadingText>
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

export function NewAppointmentSaveAction({ model }: NewAppointmentSectionProps) {
  return (
    <PrimaryButton
      size="$4"
      disabled={!model.canSave}
      opacity={model.canSave ? 1 : 0.5}
      onPress={() => {
        model.dismissInteractiveUI()
        void model.handleSave()
      }}
    >
      {model.createAppointmentLog.isPending ? 'Saving...' : 'Save Appointment'}
    </PrimaryButton>
  )
}

export function NewAppointmentImagePreviewModal({ model }: NewAppointmentSectionProps) {
  return (
    <SharedAppointmentImagePreviewModal
      previewUri={model.previewUri}
      onClose={() => model.setPreviewUri(null)}
    />
  )
}
