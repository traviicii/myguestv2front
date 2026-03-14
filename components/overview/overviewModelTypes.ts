import { UserPlus } from '@tamagui/lucide-icons'

import type { QuickActionId } from 'components/state/studioStore'

export type OverviewMetricCard = {
  id: string
  label: string
  value: string
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
