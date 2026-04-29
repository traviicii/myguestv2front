import { useRouter } from 'expo-router'
import { FlatList } from 'react-native'
import { YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  ClientsAlphabetRail,
  ClientAlphabetSectionHeader,
  ClientListRow,
  ClientsEmptyState,
  ClientsListHeader,
} from 'components/clients/sections'
import { PullToRefreshOverlay } from 'components/ui/PullToRefreshOverlay'
import { ThemedRefreshControl } from 'components/ui/controls'
import { useClientsScreenModel } from 'components/clients/useClientsScreenModel'

export default function ClientsScreen() {
  const router = useRouter()
  const model = useClientsScreenModel()

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <PullToRefreshOverlay
        top={model.topInset + 4}
        progress={model.refreshPullProgress}
        refreshing={model.isRefreshing}
        thresholdReached={model.isRefreshThresholdReached}
        pullActive={model.isRefreshPullActive}
        feedbackMessage={model.refreshFeedbackMessage}
      />
      <FlatList
        ref={model.flatListRef}
        data={model.clientListItems}
        keyExtractor={(item) =>
          item.type === 'section' ? `section-${item.letter}` : item.client.id
        }
        contentContainerStyle={{
          paddingBottom: Math.max(24, model.insets.bottom + 24),
        }}
        ListHeaderComponentStyle={{
          paddingBottom: 12,
        }}
        refreshControl={
          <ThemedRefreshControl
            refreshing={model.isRefreshing}
            onRefresh={model.handleRefresh}
            progressViewOffset={model.topInset}
          />
        }
        onScroll={model.handleClientsScroll}
        onScrollEndDrag={model.handleClientsScrollRelease}
        onMomentumScrollEnd={model.handleClientsScrollRelease}
        onScrollToIndexFailed={model.handleScrollToIndexFailed}
        onViewableItemsChanged={model.handleClientsViewableItemsChanged}
        viewabilityConfig={model.clientsViewabilityConfig}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical
        ListHeaderComponent={<ClientsListHeader model={model} />}
        ListEmptyComponent={
          <ClientsEmptyState
            model={model}
            onNewClient={() => router.push('/clients/new')}
          />
        }
        renderItem={({ item }) => {
          if (item.type === 'section') {
            return <ClientAlphabetSectionHeader letter={item.letter} />
          }

          return (
            <ClientListRow
              model={model}
              client={item.client}
              index={item.index}
              totalCount={model.filteredClients.length}
              onOpenClient={() => router.push(`/client/${item.client.id}`)}
              onNewAppointment={() => router.push(`/client/${item.client.id}/new-appointment`)}
            />
          )
        }}
      />
      <ClientsAlphabetRail model={model} />
    </YStack>
  )
}
