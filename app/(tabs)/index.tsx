// Overview (Today) dashboard: quick actions, metrics, and recent activity.
// This screen is intentionally dense but structured so power users can scan quickly.
import { useRouter } from 'expo-router'
import { Text, XStack, YStack } from 'tamagui'
import { Check, LayoutGrid, X } from '@tamagui/lucide-icons'
import { Animated as RNAnimated, RefreshControl, ScrollView } from 'react-native'
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist'
import { AmbientBackdrop } from 'components/AmbientBackdrop'
import { PrimaryButton,
  SectionDivider,
  SurfaceCard,
  ThemedHeadingText,
} from 'components/ui/controls'
import {
  useOverviewScreenModel,
} from 'components/overview/useOverviewScreenModel'
import {
  OverviewLayoutItem,
  OverviewSectionRenderer,
} from 'components/overview/sections'
import { type OverviewSectionId } from 'components/state/studioStore'

export default function TabOneScreen() {
  const router = useRouter()
  const model = useOverviewScreenModel()

  const renderLayoutItem = (params: RenderItemParams<OverviewSectionId>) => (
    <OverviewLayoutItem
      {...params}
      model={{
        isCyberpunk: model.isCyberpunk,
        sectionCardRadius: model.sectionCardRadius,
        sectionLabels: model.sectionLabels,
      }}
    />
  )

  return (
    <YStack flex={1} bg="$background" position="relative">
      <AmbientBackdrop />
      {model.showLayoutEditor ? (
        <YStack px="$5" pt={model.topInset} gap="$5">
          <YStack gap="$3">
            <Text fontSize={12} color="$textSecondary">
              Hold and drag to reorder your Overview sections.
            </Text>
            <DraggableFlatList
              data={model.layoutDraft}
              keyExtractor={(item) => item}
              renderItem={renderLayoutItem}
              onDragEnd={({ data }) => model.setLayoutDraft(data)}
              scrollEnabled={false}
              activationDistance={2}
              style={{ overflow: 'visible' }}
              contentContainerStyle={{ paddingVertical: 4 }}
            />
          </YStack>
        </YStack>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: Math.max(24, model.tabBarHeight + model.insets.bottom + 12),
          }}
          refreshControl={
            <RefreshControl
              refreshing={model.isRefreshing}
              onRefresh={model.handleRefresh}
              progressViewOffset={model.topInset}
            />
          }
          scrollEnabled={!model.isQuickActionDragging}
          alwaysBounceVertical
        >
          <YStack px="$5" pt={model.topInset} gap="$5">
            {model.isEmptyAccount ? (
              <SurfaceCard tone={model.isGlass ? 'secondary' : 'default'} p="$4" gap="$3">
                <ThemedHeadingText fontWeight="700" fontSize={16}>
                  Welcome to MyGuest
                </ThemedHeadingText>
                <Text fontSize={12} color="$textSecondary">
                  Start by adding your first client. You can log appointments after.
                </Text>
                <PrimaryButton onPress={() => router.push('/clients/new')}>
                  Add First Client
                </PrimaryButton>
              </SurfaceCard>
            ) : null}
            {model.visibleSections.map((sectionId, index) => (
              <YStack key={sectionId} gap="$3">
                <OverviewSectionRenderer
                  sectionId={sectionId}
                  model={model}
                  onNavigate={(href) => router.push(href)}
                />
                {model.aesthetic === 'modern' && index < model.visibleSections.length - 1 ? (
                  <SectionDivider />
                ) : null}
              </YStack>
            ))}
            <YStack items="center" pt="$2" pb="$2">
              <YStack height={52} items="center" justify="center" position="relative">
                <RNAnimated.View
                  pointerEvents="auto"
                  style={{
                    opacity: model.iconOpacity,
                    transform: [{ scale: model.iconScale }],
                  }}
                >
                  <XStack
                    width={44}
                    height={44}
                    rounded={model.controlRadius}
                    bg="$surfaceCard"
                    borderWidth={1}
                    borderColor="$borderColor"
                    items="center"
                    justify="center"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={model.toggleLayoutEditor}
                  >
                    <LayoutGrid size={18} color="$accent" />
                  </XStack>
                </RNAnimated.View>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      )}

      {model.showLayoutEditor ? (
        <YStack
          position="absolute"
          l={0}
          r={0}
          b={Math.max(16, model.tabBarHeight + model.insets.bottom + 8)}
          items="center"
          pointerEvents="box-none"
        >
          <RNAnimated.View
            style={{
              opacity: model.buttonsOpacity,
              transform: [{ translateY: model.buttonsTranslate }],
            }}
          >
            <XStack gap="$2">
              <RNAnimated.View style={{ transform: [{ translateX: model.leftTranslate }] }}>
                <XStack
                  rounded={model.controlRadius}
                  px="$4"
                  py="$2.5"
                  borderWidth={1}
                  borderColor="$borderColor"
                  bg="$surfaceCard"
                  items="center"
                  gap="$2"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={model.handleCancelLayout}
                >
                  <X size={14} color="$textSecondary" />
                  <Text fontSize={12} color="$textSecondary">
                    Cancel
                  </Text>
                </XStack>
              </RNAnimated.View>
              <RNAnimated.View style={{ transform: [{ translateX: model.rightTranslate }] }}>
                <XStack
                  rounded={model.controlRadius}
                  px="$4"
                  py="$2.5"
                  bg="$accent"
                  items="center"
                  gap="$2"
                  pressStyle={{ opacity: 0.85 }}
                  onPress={model.handleSaveLayout}
                >
                  <Check size={14} color="$accentContrast" />
                  <Text fontSize={12} color="$accentContrast">
                    Save
                  </Text>
                </XStack>
              </RNAnimated.View>
            </XStack>
          </RNAnimated.View>
        </YStack>
      ) : null}
    </YStack>
  )
}
