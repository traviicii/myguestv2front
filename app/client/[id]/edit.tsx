import { YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { KeyboardDismissAccessory } from 'components/ui/KeyboardDismissAccessory'
import {
  EditClientContent,
  EditClientStateMessage,
  EditClientTopBar,
} from 'components/clients/edit/sections'
import { useEditClientScreenModel } from 'components/clients/edit/useEditClientScreenModel'

export default function EditClientScreen() {
  const model = useEditClientScreenModel()

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <EditClientTopBar model={model} />
      <KeyboardDismissAccessory nativeID={model.keyboardAccessoryId} />
      {model.isBootstrapping ? (
        <EditClientStateMessage message="Loading client..." />
      ) : model.isMissingClient ? (
        <EditClientStateMessage message="Client not found." />
      ) : (
        <EditClientContent model={model} />
      )}
    </YStack>
  )
}
