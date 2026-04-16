import { YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  ClientDetailContent,
  ClientDetailStateMessage,
  ClientDetailTopBar,
} from 'components/clients/detail/sections'
import { PullToRefreshOverlay } from 'components/ui/PullToRefreshOverlay'
import { useClientDetailScreenModel } from 'components/clients/detail/useClientDetailScreenModel'

export default function ClientDetailScreen() {
  const model = useClientDetailScreenModel()

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <ClientDetailTopBar model={model} />
      <PullToRefreshOverlay
        top={model.refreshIndicatorTop}
        progress={model.refreshPullProgress}
        refreshing={model.isRefreshing}
        thresholdReached={model.isRefreshThresholdReached}
        pullActive={model.isRefreshPullActive}
        feedbackMessage={model.refreshFeedbackMessage}
      />
      {model.isBootstrapping ? (
        <ClientDetailStateMessage message="Loading client..." />
      ) : model.isMissingClient ? (
        <ClientDetailStateMessage message="Client not found." />
      ) : (
        <ClientDetailContent model={model} />
      )}
    </YStack>
  )
}
