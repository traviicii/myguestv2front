import { ScrollView, Text, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  AppointmentActionsRow,
  AppointmentDetailsSection,
  AppointmentImagePreviewModal,
  AppointmentPhotosSection,
} from 'components/appointments/edit/sections'
import { useEditAppointmentScreenModel } from 'components/appointments/edit/useEditAppointmentScreenModel'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { SectionDivider } from 'components/ui/controls'

export default function EditAppointmentScreen() {
  const model = useEditAppointmentScreenModel()

  if (model.isBootstrapping) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} />
        <Text fontSize={13} color="$textSecondary">
          Loading appointment...
        </Text>
      </YStack>
    )
  }

  if (!model.appointment) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} />
        <Text fontSize={13} color="$textSecondary">
          Appointment not found.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} />
      <KeyboardDismissAccessory nativeID={model.keyboardAccessoryId} />
      <ScrollView
        ref={model.scrollRef}
        contentContainerStyle={{ pb: '$10' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={model.keyboardDismissMode}
        onScrollBeginDrag={model.handleScrollBeginDrag}
      >
        <YStack px="$5" pt="$5" gap="$3">
          <YStack gap="$1">
            <Text fontSize={11} letterSpacing={1} color="$textMuted">
              EDIT APPOINTMENT LOG
            </Text>
            <Text fontFamily="$heading" fontSize={20} fontWeight="700" color="$color">
              {model.client?.name ?? 'Client'}
            </Text>
          </YStack>

          <SectionDivider />

          <AppointmentDetailsSection model={model} />
          <AppointmentPhotosSection model={model} />
          <AppointmentActionsRow model={model} />
        </YStack>
      </ScrollView>
      <AppointmentImagePreviewModal model={model} />
    </YStack>
  )
}
