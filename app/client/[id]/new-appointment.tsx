import { Pressable } from 'react-native'
import { ScrollView, Text, YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  NewAppointmentDetailsSection,
  NewAppointmentHeader,
  NewAppointmentImagePreviewModal,
  NewAppointmentPhotosSection,
  NewAppointmentSaveAction,
} from 'components/appointments/new/sections'
import { useNewAppointmentScreenModel } from 'components/appointments/new/useNewAppointmentScreenModel'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { SectionDivider } from 'components/ui/controls'

export default function NewAppointmentScreen() {
  const model = useNewAppointmentScreenModel()

  if (model.isBootstrapping) {
    return (
      <YStack flex={1} bg="$background" position="relative">
        <AmbientBackdrop />
        <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} />
        <YStack flex={1} items="center" justify="center">
          <Text fontSize={13} color="$textSecondary">
            Loading client...
          </Text>
        </YStack>
      </YStack>
    )
  }

  if (!model.client) {
    return (
      <YStack flex={1} bg="$background" position="relative">
        <AmbientBackdrop />
        <ScreenTopBar topInset={model.topInset} onBack={model.handleBack} />
        <YStack flex={1} items="center" justify="center">
          <Text fontSize={13} color="$textSecondary">
            Client not found.
          </Text>
        </YStack>
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
        onScrollBeginDrag={model.dismissInteractiveUI}
      >
        <Pressable onPress={model.dismissInteractiveUI}>
          <YStack px="$5" pt="$3" gap="$3">
            <NewAppointmentHeader model={model} />

            <SectionDivider />

            <NewAppointmentDetailsSection model={model} />
            <NewAppointmentPhotosSection model={model} />
            <NewAppointmentSaveAction model={model} />
          </YStack>
        </Pressable>
      </ScrollView>
      <NewAppointmentImagePreviewModal model={model} />
    </YStack>
  )
}
