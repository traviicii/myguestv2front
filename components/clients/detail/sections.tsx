import { ScrollView, YStack } from 'tamagui'

import { SectionDivider } from 'components/ui/controls'
import { ThemedRefreshControl } from 'components/ui/ThemedRefreshControl'

import { ClientColorChartSection } from './ClientColorChartSection'
import { ClientContactSection } from './ClientContactSection'
import { ClientHeroSection } from './ClientHeroSection'
import { ClientNotesSection } from './ClientNotesSection'
import { ClientQuickActionsSection } from './ClientQuickActionsSection'
import { ClientRebookingSection } from './ClientRebookingSection'
import { ClientTimelineSection } from './ClientTimelineSection'
import { ClientDetailStateMessage } from './ClientDetailPrimitives'
import { ClientDetailTopBar } from './ClientDetailTopBar'
import type { ClientDetailSectionProps } from './sectionTypes'

export { ClientDetailStateMessage, ClientDetailTopBar }

export function ClientDetailContent({ model }: ClientDetailSectionProps) {
  if (!model.client) return null

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 } as never}
      refreshControl={
        <ThemedRefreshControl
          refreshing={model.isRefreshing}
          onRefresh={model.handleRefresh}
          progressViewOffset={model.refreshIndicatorTop}
          tintColor={model.refreshTintColor}
          colors={[model.refreshTintColor]}
        />
      }
      onScroll={model.handleRefreshScroll}
      onScrollEndDrag={model.handleRefreshScrollRelease}
      onMomentumScrollEnd={model.handleRefreshScrollRelease}
      scrollEventThrottle={16}
      alwaysBounceVertical
    >
      <YStack px="$5" pt="$3" gap="$4">
        <ClientHeroSection model={model} />
        <ClientQuickActionsSection model={model} />
        <SectionDivider />
        <ClientContactSection model={model} />
        <SectionDivider />
        <ClientNotesSection model={model} />
        <SectionDivider />
        <ClientTimelineSection model={model} />
        <SectionDivider />
        {model.rebookingRecommendation ? (
          <>
            <ClientRebookingSection model={model} />
            <SectionDivider />
          </>
        ) : null}
        <ClientColorChartSection model={model} />
      </YStack>
    </ScrollView>
  )
}
