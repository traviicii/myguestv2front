import { UserPlus } from '@tamagui/lucide-icons'

import type { QuickActionId } from 'components/state/studioStore'

export type OverviewMetricCard = {
  id: string
  label: string
  value: string
}

export type OverviewAttentionPreviewItem = {
  clientId: string
  clientName: string
  primaryLabel: string
  secondaryLabel: string
}

export type OverviewAttentionCard = {
  id: 'dueThisWeek' | 'overdue' | 'upcomingBirthdays'
  label: string
  count: number
  summary: string
  priority: 'high' | 'medium' | 'low'
  emptyLabel: string
  previewItems: OverviewAttentionPreviewItem[]
}

type OverviewQuickActionIcon = typeof UserPlus

export type OverviewQuickAction = {
  id: QuickActionId
  label: string
  icon: OverviewQuickActionIcon
  href?: '/clients/new' | '/appointments/new'
  variant: 'primary' | 'secondary' | 'ghost'
  comingSoon?: boolean
}
