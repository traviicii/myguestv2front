import type { Href } from 'expo-router'
import { Animated as RNAnimated } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { ExpandableEditPanel } from 'components/ui/ExpandableEditPanel'
import { SortableGrid } from 'components/ui/SortableGrid'
import {
  GhostButton,
  GlassOrbAction,
  ThemedHeadingText,
  ThemedSwitch,
} from 'components/ui/controls'
import { FALLBACK_COLORS } from 'components/utils/color'

import type { OverviewNavigableSectionProps, OverviewQuickActionCardProps } from './sectionTypes'

const editPanelCardBorder = {
  bg: '$surfaceCard',
  borderWidth: 1,
  borderColor: '$borderSubtle',
} as const

function QuickActionCard({
  action,
  model,
  onPress,
  isDragging = false,
}: OverviewQuickActionCardProps) {
  const Icon = action.icon
  const isPrimary = action.variant === 'primary'
  const isSecondary = action.variant === 'secondary'
  const isDisabled = action.comingSoon

  if (model.isGlass) {
    return (
      <YStack scale={isDragging ? 0.97 : 1}>
        <GlassOrbAction
          label={action.label}
          icon={<Icon size={24} />}
          variant={action.variant}
          disabled={Boolean(isDisabled)}
          onPress={!isDisabled ? onPress : undefined}
        />
      </YStack>
    )
  }

  const backgroundColor = isPrimary ? '$buttonPrimaryBg' : '$surfaceCard'
  const borderWidth = isPrimary ? 0 : 1
  const borderColor = isPrimary ? 'transparent' : '$borderColor'
  const iconColor = isPrimary
    ? '$buttonPrimaryFg'
    : isSecondary
      ? '$accent'
      : '$textSecondary'
  const labelColor = isPrimary
    ? '$buttonPrimaryFg'
    : isSecondary
      ? '$accent'
      : '$textSecondary'

  return (
    <YStack
      width={140}
      aspectRatio={1}
      rounded={model.actionCardRadius}
      bg={backgroundColor}
      borderWidth={borderWidth}
      borderColor={borderColor}
      items="center"
      justify="center"
      gap="$2"
      cursor={isDisabled ? 'default' : 'pointer'}
      shadowColor={
        isPrimary ? FALLBACK_COLORS.shadowPrimaryCard : FALLBACK_COLORS.shadowSecondaryCard
      }
      shadowRadius={16}
      shadowOpacity={1}
      shadowOffset={{ width: 0, height: 8 }}
      elevation={isPrimary ? 4 : 3}
      opacity={isDisabled ? 0.55 : 1}
      pressStyle={isDisabled ? undefined : { opacity: 0.85 }}
      onPress={!isDisabled ? onPress : undefined}
      scale={isDragging ? 0.97 : 1}
    >
      <Icon size={24} color={iconColor} />
      <Text fontSize={12} color={labelColor} style={{ textAlign: 'center' }}>
        {action.label}
      </Text>
      {isDisabled ? (
        <Text fontSize={10} color="$textMuted">
          Coming soon
        </Text>
      ) : null}
    </YStack>
  )
}

export function OverviewQuickActionsSection({
  model,
  onNavigate,
}: OverviewNavigableSectionProps) {
  return (
    <YStack>
      <XStack items="center" justify="space-between" mb="$2">
        <ThemedHeadingText fontWeight="700" fontSize={16}>
          Quick Actions
        </ThemedHeadingText>
        <GhostButton onPress={model.toggleQuickActionEditor}>
          {model.showQuickActionEditor ? 'Done' : 'Edit'}
        </GhostButton>
      </XStack>
      <ExpandableEditPanel
        visible={model.showQuickActionEditor}
        lineColor={model.lineColor}
        cardProps={editPanelCardBorder}
      >
        {() => (
          <>
            {model.orderedQuickActions.map((action) => (
              <XStack key={action.id} items="center" justify="space-between">
                <Text fontSize={12} color="$textSecondary">
                  {action.label}
                </Text>
                <ThemedSwitch
                  size="$2"
                  checked={model.appSettings.overviewQuickActions[action.id]}
                  onCheckedChange={(checked) =>
                    model.setQuickActionEnabled(action.id, Boolean(checked))
                  }
                />
              </XStack>
            ))}
          </>
        )}
      </ExpandableEditPanel>
      <RNAnimated.View
        pointerEvents="none"
        style={{
          opacity: model.quickActionHintAnim,
          height: model.quickActionHintAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 18],
          }),
          marginTop: model.quickActionHintAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 8],
          }),
          overflow: 'hidden',
        }}
      >
        <Text fontSize={12} color="$textSecondary">
          Drag buttons to rearrange order.
        </Text>
      </RNAnimated.View>
      <YStack mt="$1" minH={160} justify="center" items="center" width="100%">
        {model.enabledQuickActions.length ? (
          <YStack
            width="100%"
            position="relative"
            minH={160}
            height={Math.max(model.quickActionGridHeight, 160)}
          >
            <SortableGrid
              data={model.enabledQuickActions}
              keyExtractor={(item) => item.id}
              columns={model.quickActionColumns}
              itemSize={model.quickActionItemSize}
              gap={model.quickActionGap}
              centerLastRow={model.shouldCenterQuickActionRow}
              dragEnabled={model.showQuickActionEditor}
              onDragActiveChange={model.setIsQuickActionDragging}
              onOrderChange={model.handleQuickActionReorder}
              renderItem={(item, isActive) => {
                const href = item.href as Href | undefined
                return (
                  <QuickActionCard
                    action={item}
                    model={model}
                    isDragging={isActive}
                    onPress={
                      !model.showQuickActionEditor && href && !item.comingSoon
                        ? () => onNavigate(href)
                        : undefined
                    }
                  />
                )
              }}
            />
          </YStack>
        ) : (
          <Text fontSize={12} color="$textSecondary">
            No quick actions selected.
          </Text>
        )}
      </YStack>
    </YStack>
  )
}
