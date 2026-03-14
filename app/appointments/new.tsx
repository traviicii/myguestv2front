import { NewAppointmentClientPickerContent } from 'components/appointments/clientPicker/sections'
import { useNewAppointmentClientPickerScreenModel } from 'components/appointments/clientPicker/useNewAppointmentClientPickerScreenModel'

export default function NewAppointmentClientPicker() {
  const model = useNewAppointmentClientPickerScreenModel()
  return <NewAppointmentClientPickerContent model={model} />
}
