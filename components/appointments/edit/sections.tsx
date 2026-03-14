import { ChevronDown } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { AppointmentDatePickerField } from 'components/appointments/shared/AppointmentDatePickerField'
import { AppointmentImagePreviewModal as SharedAppointmentImagePreviewModal } from 'components/appointments/shared/AppointmentImagePreviewModal'
import { AppointmentPhotoSection } from 'components/appointments/shared/AppointmentPhotoSection'
import { AppointmentServicePickerPanel } from 'components/appointments/shared/AppointmentServicePickerPanel'
import {
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextAreaField,
  TextField,
} from 'components/ui/controls'

import type { EditAppointmentScreenModel } from './useEditAppointmentScreenModel'

type EditAppointmentSectionProps = {
  model: EditAppointmentScreenModel
}

export function AppointmentDetailsSection({ model }: EditAppointmentSectionProps) {
  return (
    <SurfaceCard mode={model.cardMode} tone={model.cardTone} p="$4" gap="$2.5">
      <YStack
        gap="$2"
        onLayout={(event) => {
          model.requiredY.current.date = event.nativeEvent.layout.y
        }}
      >
        <Text fontSize={12} color="$textSecondary">
          Date
        </Text>
        <AppointmentDatePickerField
          datePanel={model.datePanel}
          displayValue={model.form.date}
          fieldBackground="$surfaceField"
          onDateChange={model.handleDateChange}
          onFieldPress={model.handleDateFieldPress}
          pickerDate={model.pickerDate}
          pulseKey={model.pulseKey}
          showDateError={model.showDateError}
          showDatePicker={model.showDatePicker}
        />
      </YStack>
      <YStack gap="$2">
        <Text fontSize={12} color="$textSecondary">
          Services
        </Text>
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
          cardMode={model.cardMode}
          cardTone={model.cardTone}
          isGlass={model.isGlass}
          servicePanel={model.servicePanel}
          services={model.pickerServices}
          selectedServiceIds={model.selectedServiceIds}
          onClear={model.clearSelectedServices}
          onToggleService={model.toggleServiceSelection}
        />
      </YStack>
      <YStack gap="$2">
        <Text fontSize={12} color="$textSecondary">
          Price
        </Text>
        <TextField
          placeholder="$0.00"
          value={model.form.price}
          inputAccessoryViewID={model.keyboardAccessoryId}
          onFocus={model.closePickers}
          onChangeText={(text) => model.setForm((prev) => ({ ...prev, price: text }))}
        />
        {model.suggestedPriceCents !== null ? (
          <XStack items="center" justify="space-between" gap="$2">
            <Text fontSize={11} color="$textSecondary">
              Suggested from services: $
              {model.formatPriceFromCents(model.suggestedPriceCents)}
            </Text>
            {model.form.price.trim() !==
            model.formatPriceFromCents(model.suggestedPriceCents) ? (
              <SecondaryButton size="$2" px="$2" onPress={model.applySuggestedPrice}>
                Apply Suggested
              </SecondaryButton>
            ) : null}
          </XStack>
        ) : null}
      </YStack>
      <YStack gap="$2">
        <Text fontSize={12} color="$textSecondary">
          Formula / Notes
        </Text>
        <TextAreaField
          placeholder="Color formula, technique, notes..."
          value={model.form.notes}
          inputAccessoryViewID={model.keyboardAccessoryId}
          onFocus={model.closePickers}
          onChangeText={(text) => model.setForm((prev) => ({ ...prev, notes: text }))}
        />
      </YStack>
    </SurfaceCard>
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
