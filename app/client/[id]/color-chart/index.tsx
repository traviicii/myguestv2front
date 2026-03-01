import {
  Link,
  Stack,
  useLocalSearchParams,
  useRouter,
  type Href } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView,
  Text,
  XStack,
  YStack } from 'tamagui'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { useClients,
  useColorAnalysisByClient,
  useColorAnalysisForClient,
  } from 'components/data/queries'
import { COLOR_CHART_FIELD_LABELS,
  COLOR_CHART_GROUPS,
  } from 'components/colorChart/config'
import { createColorChartFormState,
  getColorChartDisplayValue,
  hasAnyColorChartValues,
  } from 'components/colorChart/form'
import { PrimaryButton,
  SectionDivider,
  SecondaryButton,
  SurfaceCard,
  cardSurfaceProps,
} from 'components/ui/controls'
import { ScreenTopBar } from 'components/ui/ScreenTopBar'
import { useThemePrefs } from 'components/ThemePrefs'

export default function ClientColorChartDetailsScreen() {
  const { aesthetic } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top + 8, 16)
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: colorAnalysisByClient = {} } = useColorAnalysisByClient()

  const client = clients.find((item) => item.id === id)
  const clientId = client?.id
  const { data: colorAnalysisForClient } = useColorAnalysisForClient(clientId)
  const colorAnalysis = client
    ? colorAnalysisForClient ?? colorAnalysisByClient[client.id]
    : undefined
  const colorChart = createColorChartFormState(colorAnalysis)
  const hasValues = hasAnyColorChartValues(colorChart)
  const isBootstrapping = clientsLoading && !clients.length

  const editHref: Href =
    id && typeof id === 'string'
      ? { pathname: '/client/[id]/color-chart/edit', params: { id } }
      : '/clients'

  if (isBootstrapping) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <Text fontSize={13} color="$textSecondary">
          Loading client...
        </Text>
      </YStack>
    )
  }

  if (!client) {
    return (
      <YStack flex={1} bg="$background" items="center" justify="center">
        <AmbientBackdrop />
        <ScreenTopBar topInset={topInset} onBack={() => router.back()} />
        <Text fontSize={13} color="$textSecondary">
          Client not found.
        </Text>
      </YStack>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} bg="$background" position="relative">
        <AmbientBackdrop />
        <ScreenTopBar
          topInset={topInset}
          onBack={() => router.back()}
          rightAction={
            <Link href={editHref} asChild>
              <SecondaryButton size="$2" height={36} width={72} px="$3">
                Edit
              </SecondaryButton>
            </Link>
          }
        />
        <ScrollView contentContainerStyle={{ pb: '$10' }} keyboardShouldPersistTaps="handled">
          <YStack px="$5" pt="$6" gap="$4">
            <YStack gap="$1">
              <Text fontFamily="$heading" fontWeight="700" fontSize={20} color="$color">
                {client.name}
              </Text>
              <Text fontSize={12} color="$textSecondary">
                Color Chart
              </Text>
            </YStack>

            {!hasValues ? (
              isGlass ? (
                <SurfaceCard mode="alwaysCard" tone="secondary" p="$4" gap="$3">
                  <Text fontSize={12} color="$textSecondary">
                    No color chart details recorded yet.
                  </Text>
                  <Link href={editHref} asChild>
                    <PrimaryButton size="$4">Start Color Chart</PrimaryButton>
                  </Link>
                </SurfaceCard>
              ) : (
                <YStack {...cardSurfaceProps} rounded="$5" p="$4" gap="$3">
                  <Text fontSize={12} color="$textSecondary">
                    No color chart details recorded yet.
                  </Text>
                  <Link href={editHref} asChild>
                    <PrimaryButton size="$4">Start Color Chart</PrimaryButton>
                  </Link>
                </YStack>
              )
            ) : null}

            <SectionDivider />

            {COLOR_CHART_GROUPS.map((group, index) => (
              <YStack key={group.id} gap="$3">
                <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
                  {group.title}
                </Text>
                {isGlass ? (
                  <SurfaceCard mode="alwaysCard" tone="secondary" p="$4" gap="$2.5">
                    {group.fields.map((field) => (
                      <XStack key={field} justify="space-between" items="center" gap="$3">
                        <Text fontSize={12} color="$textSecondary" flex={1}>
                          {COLOR_CHART_FIELD_LABELS[field]}
                        </Text>
                        <Text fontSize={12} style={{ textAlign: 'right' }}>
                          {getColorChartDisplayValue(colorChart[field])}
                        </Text>
                      </XStack>
                    ))}
                  </SurfaceCard>
                ) : (
                  <YStack {...cardSurfaceProps} rounded="$5" p="$4" gap="$2.5">
                    {group.fields.map((field) => (
                      <XStack key={field} justify="space-between" items="center" gap="$3">
                        <Text fontSize={12} color="$textSecondary" flex={1}>
                          {COLOR_CHART_FIELD_LABELS[field]}
                        </Text>
                        <Text fontSize={12} style={{ textAlign: 'right' }}>
                          {getColorChartDisplayValue(colorChart[field])}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                )}
                {index < COLOR_CHART_GROUPS.length - 1 ? <SectionDivider /> : null}
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </>
  )
}
