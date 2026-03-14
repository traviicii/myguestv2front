import type { Href } from 'expo-router'
import type { OverviewSectionId } from 'components/state/studioStore'

import type { OverviewQuickAction } from './overviewModelTypes'
import type { OverviewScreenModel } from './useOverviewScreenModel'

export type Navigate = (href: Href) => void

export type OverviewSectionProps = {
  model: OverviewScreenModel
}

export type OverviewNavigableSectionProps = OverviewSectionProps & {
  onNavigate: Navigate
}

export type OverviewLayoutItemModel = Pick<
  OverviewScreenModel,
  'isCyberpunk' | 'sectionCardRadius' | 'sectionLabels'
>

export type OverviewLayoutItemProps = {
  item: OverviewSectionId
  model: OverviewLayoutItemModel
}

export type OverviewQuickActionCardProps = {
  action: OverviewQuickAction
  isDragging?: boolean
  model: Pick<OverviewScreenModel, 'actionCardRadius' | 'isGlass'>
  onPress?: () => void
}
