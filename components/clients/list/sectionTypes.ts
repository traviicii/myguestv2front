import type { ClientsScreenModel } from '../useClientsScreenModel'

export type ClientRow = ClientsScreenModel['filteredClients'][number]

export type ClientsSectionProps = {
  model: ClientsScreenModel
}
