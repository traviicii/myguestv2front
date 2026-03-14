import type { QuickActionId } from 'components/state/studioStore'

import { overviewQuickActions } from './overviewQuickActionConfig'
import type { OverviewQuickAction } from './overviewModelTypes'

export function getOrderedQuickActions(order: QuickActionId[]): OverviewQuickAction[] {
  const actionMap = new Map(overviewQuickActions.map((action) => [action.id, action]))
  const ordered = order
    .map((id) => actionMap.get(id))
    .filter(Boolean) as OverviewQuickAction[]
  const missing = overviewQuickActions.filter((action) => !order.includes(action.id))
  return [...ordered, ...missing]
}
