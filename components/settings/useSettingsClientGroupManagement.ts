import { useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import { useToastController } from '@tamagui/toast'

import type { ClientGroup } from 'components/data/api/clientGroups'
import {
  useArchiveClientGroup,
  useClientGroups,
  useCreateClientGroup,
  useReactivateClientGroup,
  useUpdateClientGroup,
} from 'components/data/queries'
import { normalizeClientGroupName } from 'components/utils/clientGroups'

const EMPTY_CLIENT_GROUPS: ClientGroup[] = []

export function useSettingsClientGroupManagement() {
  const toast = useToastController()
  const { data: clientGroupCatalog = EMPTY_CLIENT_GROUPS } = useClientGroups('all')
  const createClientGroup = useCreateClientGroup()
  const updateClientGroup = useUpdateClientGroup()
  const archiveClientGroup = useArchiveClientGroup()
  const reactivateClientGroup = useReactivateClientGroup()
  const [clientGroupDraft, setClientGroupDraft] = useState('')
  const [clientGroupRenameDrafts, setClientGroupRenameDrafts] = useState<Record<number, string>>({})

  const activeClientGroups = useMemo(
    () =>
      clientGroupCatalog
        .filter((group) => !group.archivedAt)
        .sort((left, right) => {
          if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder
          return left.name.localeCompare(right.name)
        }),
    [clientGroupCatalog]
  )

  const archivedClientGroups = useMemo(
    () =>
      clientGroupCatalog
        .filter((group) => group.archivedAt)
        .sort((left, right) => left.name.localeCompare(right.name)),
    [clientGroupCatalog]
  )

  useEffect(() => {
    setClientGroupRenameDrafts((current) => {
      let didChange = false
      const next = { ...current }
      clientGroupCatalog.forEach((group) => {
        if (next[group.id] === undefined) {
          next[group.id] = group.name
          didChange = true
        }
      })

      return didChange ? next : current
    })
  }, [clientGroupCatalog])

  const canAddClientGroup = Boolean(normalizeClientGroupName(clientGroupDraft))

  const handleAddClientGroup = async () => {
    const name = normalizeClientGroupName(clientGroupDraft)
    if (!name || createClientGroup.isPending) return
    try {
      await createClientGroup.mutateAsync({ name })
      setClientGroupDraft('')
      toast.show('Client group added')
    } catch (error) {
      Alert.alert(
        'Group Not Saved',
        error instanceof Error ? error.message : 'Unable to add this group right now.'
      )
    }
  }

  const handleClientGroupRenameDraftChange = (groupId: number, value: string) => {
    setClientGroupRenameDrafts((current) => ({ ...current, [groupId]: value }))
  }

  const handleSaveClientGroupRename = async (groupId: number) => {
    const group = clientGroupCatalog.find((item) => item.id === groupId)
    if (!group) return
    const name = normalizeClientGroupName(clientGroupRenameDrafts[groupId] ?? '')
    if (!name || name === group.name || updateClientGroup.isPending) return
    try {
      await updateClientGroup.mutateAsync({ groupId, name })
      toast.show('Client group renamed')
    } catch (error) {
      setClientGroupRenameDrafts((current) => ({ ...current, [groupId]: group.name }))
      Alert.alert(
        'Rename Failed',
        error instanceof Error ? error.message : 'Unable to rename this group right now.'
      )
    }
  }

  const handleArchiveClientGroup = async (groupId: number) => {
    const group = clientGroupCatalog.find((item) => item.id === groupId)
    if (!group || archiveClientGroup.isPending) return
    try {
      await archiveClientGroup.mutateAsync(groupId)
      toast.show(`${group.name} archived`)
    } catch (error) {
      Alert.alert(
        'Archive Failed',
        error instanceof Error ? error.message : 'Unable to archive this group right now.'
      )
    }
  }

  const handleReactivateClientGroup = async (groupId: number) => {
    if (reactivateClientGroup.isPending) return
    try {
      await reactivateClientGroup.mutateAsync(groupId)
      toast.show('Client group restored')
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        error instanceof Error ? error.message : 'Unable to restore this group right now.'
      )
    }
  }

  return {
    activeClientGroups,
    archivedClientGroups,
    canAddClientGroup,
    clientGroupDraft,
    clientGroupRenameDrafts,
    createClientGroup,
    handleAddClientGroup,
    handleArchiveClientGroup,
    handleClientGroupRenameDraftChange,
    handleReactivateClientGroup,
    handleSaveClientGroupRename,
    setClientGroupDraft,
  }
}
