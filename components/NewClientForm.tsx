import { NewClientFormContent } from 'components/clients/new/sections'
import { useNewClientFormModel } from 'components/clients/new/useNewClientFormModel'

export function NewClientForm() {
  const model = useNewClientFormModel()
  return <NewClientFormContent model={model} />
}
