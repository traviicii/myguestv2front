import { useQueryClient } from '@tanstack/react-query'

import { DATA_SOURCE_KIND, dataSource } from '../source'

export { DATA_SOURCE_KIND, dataSource }

const isMockSource = DATA_SOURCE_KIND === 'mock'

export const initialIfMock = <T,>(value: T) => (isMockSource ? value : undefined)

export function useDataQueryClient() {
  return useQueryClient()
}
