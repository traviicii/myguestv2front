import { useRouter } from 'expo-router'
import { FlatList, RefreshControl } from 'react-native'
import { YStack } from 'tamagui'

import { AmbientBackdrop } from 'components/AmbientBackdrop'
import {
  ClientListRow,
  ClientsEmptyState,
  ClientsListHeader,
} from 'components/clients/sections'
import { useClientsScreenModel } from 'components/clients/useClientsScreenModel'

export default function ClientsScreen() {
  const router = useRouter()
  const model = useClientsScreenModel()

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      <FlatList
        data={model.filteredClients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: Math.max(24, model.insets.bottom + 24),
        }}
        refreshControl={
          <RefreshControl
            refreshing={model.isRefreshing}
            onRefresh={model.handleRefresh}
            progressViewOffset={model.topInset}
          />
        }
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical
        ListHeaderComponent={<ClientsListHeader model={model} />}
        ListEmptyComponent={
          <ClientsEmptyState
            model={model}
            onNewClient={() => router.push('/clients/new')}
          />
        }
        renderItem={({ item: client, index }) => (
          <ClientListRow
            model={model}
            client={client}
            index={index}
            totalCount={model.filteredClients.length}
            onOpenClient={() => router.push(`/client/${client.id}`)}
            onNewAppointment={() => router.push(`/client/${client.id}/new-appointment`)}
          />
        )}
      />
    </YStack>
  )
}
