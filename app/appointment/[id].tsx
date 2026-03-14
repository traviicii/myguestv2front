import { YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  AppointmentDetailContent,
  AppointmentDetailStateMessage,
  AppointmentDetailTopBar,
} from 'components/appointments/detail/sections'
import { useAppointmentDetailScreenModel } from 'components/appointments/detail/useAppointmentDetailScreenModel'

export default function AppointmentDetailScreen() {
  const model = useAppointmentDetailScreenModel()

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <AppointmentDetailTopBar model={model} />
      {model.isBootstrapping ? (
        <AppointmentDetailStateMessage message="Loading appointment..." />
      ) : model.isMissingAppointment ? (
        <AppointmentDetailStateMessage message="Appointment not found." />
      ) : (
        <AppointmentDetailContent model={model} />
      )}
    </YStack>
  )
}
