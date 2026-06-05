import { useMutation, useQuery } from '@tanstack/react-query'

import type {
  ClientGroup,
  CreateClientGroupInput,
  UpdateClientGroupInput,
} from '../api/clientGroups'
import { MOCK_CLIENT_GROUPS } from '../sources/mock'
import { DATA_SOURCE_KIND, dataSource, initialIfMock, useDataQueryClient } from './shared'

const sortClientGroups = (groups: ClientGroup[]) =>
  [...groups].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder
    }
    return left.name.localeCompare(right.name)
  })

const upsertClientGroup = (
  current: ClientGroup[] | undefined,
  group: ClientGroup,
  {
    includeArchived = false,
  }: {
    includeArchived?: boolean
  } = {}
) => {
  const base = current ?? []
  const next = base.filter((item) => item.id !== group.id)
  if (!group.archivedAt || includeArchived) {
    next.push(group)
  }
  return sortClientGroups(next)
}

const syncClientGroupCaches = (
  queryClient: ReturnType<typeof useDataQueryClient>,
  group: ClientGroup
) => {
  queryClient.setQueryData<ClientGroup[]>(
    ['client-groups', DATA_SOURCE_KIND, 'true'],
    (current) => upsertClientGroup(current, group)
  )
  queryClient.setQueryData<ClientGroup[]>(
    ['client-groups', DATA_SOURCE_KIND, 'false'],
    (current) => upsertClientGroup(current, group, { includeArchived: Boolean(group.archivedAt) })
  )
  queryClient.setQueryData<ClientGroup[]>(
    ['client-groups', DATA_SOURCE_KIND, 'all'],
    (current) => upsertClientGroup(current, group, { includeArchived: true })
  )
}

export function useClientGroups(active: 'true' | 'false' | 'all' = 'true') {
  const initialGroups =
    active === 'all'
      ? MOCK_CLIENT_GROUPS
      : active === 'false'
        ? MOCK_CLIENT_GROUPS.filter((group) => group.archivedAt)
        : MOCK_CLIENT_GROUPS.filter((group) => !group.archivedAt)

  return useQuery({
    queryKey: ['client-groups', DATA_SOURCE_KIND, active],
    queryFn: () => dataSource.fetchClientGroups(active),
    initialData: initialIfMock(initialGroups),
  })
}

export function useCreateClientGroup() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (input: CreateClientGroupInput) => dataSource.createClientGroup(input),
    onSuccess: async (group) => {
      syncClientGroupCaches(queryClient, group)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client-groups'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}

export function useUpdateClientGroup() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (input: UpdateClientGroupInput) => dataSource.updateClientGroup(input),
    onSuccess: async (group) => {
      syncClientGroupCaches(queryClient, group)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client-groups'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}

export function useArchiveClientGroup() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => dataSource.archiveClientGroup(groupId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client-groups'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}

export function useReactivateClientGroup() {
  const queryClient = useDataQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => dataSource.reactivateClientGroup(groupId),
    onSuccess: async (group) => {
      syncClientGroupCaches(queryClient, group)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client-groups'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}
