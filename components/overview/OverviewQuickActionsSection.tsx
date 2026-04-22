import type { Href } from 'expo-router'
import { useMemo } from 'react'
import { Animated as RNAnimated, StyleSheet } from 'react-native'
import { Text, XStack, YStack, useTheme } from 'tamagui'

import { ExpandableEditPanel } from 'components/ui/ExpandableEditPanel'
import { SortableGrid } from 'components/ui/SortableGrid'
import { buildSortableGridLayout } from 'components/ui/sortableGridUtils'
import {
  GhostButton,
  GlassOrbAction,
  ThemedHeadingText,
  ThemedSwitch,
} from 'components/ui/controls'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

import Svg, { Polygon } from 'react-native-svg'

import type { OverviewNavigableSectionProps, OverviewQuickActionCardProps } from './sectionTypes'

const CYBERPUNK_HEX_CARD_SIZE = 144
const CYBERPUNK_HEX_POINTS = '35,1 105,1 139,61 105,121 35,121 1,61'

function QuickActionCard({
  action,
  model,
  onPress,
  isDragging = false,
}: OverviewQuickActionCardProps) {
  const theme = useTheme()
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

  if (model.isCyberpunk) {
    const hexFill = isPrimary
      ? toNativeColor(theme.buttonPrimaryBg?.val, FALLBACK_COLORS.cyberPrimaryBg)
      : toNativeColor(theme.surfaceCard?.val, FALLBACK_COLORS.cyberSurfaceCard)
    const hexStroke = isPrimary
      ? toNativeColor(theme.accent?.val, FALLBACK_COLORS.cyberAccent)
      : isSecondary
        ? toNativeColor(theme.accent?.val, FALLBACK_COLORS.cyberAccent)
        : toNativeColor(theme.borderColor?.val, FALLBACK_COLORS.borderSubtle)
    return (
      <YStack
        width={CYBERPUNK_HEX_CARD_SIZE}
        aspectRatio={1}
        position="relative"
        items="center"
        justify="center"
        cursor={isDisabled ? 'default' : 'pointer'}
        opacity={isDisabled ? 0.55 : 1}
        pressStyle={isDisabled ? undefined : { opacity: 0.88 }}
        onPress={!isDisabled ? onPress : undefined}
        scale={isDragging ? 0.97 : 1}
        shadowColor={isPrimary ? FALLBACK_COLORS.shadowPrimaryCard : FALLBACK_COLORS.shadowSecondaryCard}
        shadowRadius={isPrimary ? 18 : 14}
        shadowOpacity={isPrimary ? 0.38 : 0.22}
        shadowOffset={{ width: 0, height: 6 }}
        elevation={isPrimary ? 4 : 2}
      >
        <YStack style={styles.hexShell}>
          <Svg
            pointerEvents="none"
            viewBox="0 0 140 122"
            preserveAspectRatio="none"
            style={styles.hexFrame}
          >
            <Polygon
              points={CYBERPUNK_HEX_POINTS}
              fill={hexFill}
              stroke={hexStroke}
              strokeWidth={isPrimary ? 2.25 : 1.5}
            />
          </Svg>
          <YStack
            px="$4.5"
            py="$3"
            gap="$1.5"
            items="center"
            justify="center"
            width="100%"
            height="100%"
          >
            <Icon size={24} color={iconColor} />
            <Text
              fontSize={12}
              color={labelColor}
              style={{ textAlign: 'center' }}
              numberOfLines={2}
            >
              {action.label}
            </Text>
            {isDisabled ? (
              <Text fontSize={10} color="$textMuted">
                Coming soon
              </Text>
            ) : null}
          </YStack>
        </YStack>
      </YStack>
    )
  }

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
  const sectionGap = model.isCyberpunk ? '$2' : '$3'
  const cyberpunkQuickActionLayout = useMemo(
    () =>
      model.isCyberpunk
        ? buildSortableGridLayout({
            columns: model.quickActionColumns,
            itemCount: model.enabledQuickActions.length,
            itemSize: model.quickActionItemSize,
            gap: model.quickActionGap,
            layoutVariant: 'hexHoneycomb',
          })
        : null,
    [
      model.enabledQuickActions.length,
      model.isCyberpunk,
      model.quickActionColumns,
      model.quickActionGap,
      model.quickActionItemSize,
    ]
  )
  const quickActionClusterInsetTop = model.isCyberpunk ? 8 : 0
  const quickActionClusterInsetBottom = model.isCyberpunk ? 14 : 0
  const quickActionClusterHeight = cyberpunkQuickActionLayout
    ? Math.max(cyberpunkQuickActionLayout.containerHeight, model.quickActionItemSize)
    : Math.max(model.quickActionGridHeight, 160)
  const editPanelCardBorder = {
    bg: '$surfaceCard',
    borderWidth: 1,
    borderColor: '$borderSubtle',
    rounded: model.controlRadius,
    gap: model.isCyberpunk ? '$2' : '$3',
  } as const
  const rowProps = model.isCyberpunk
    ? ({
        px: '$2.5',
        py: '$2',
        minH: 44,
        borderWidth: 1,
        borderColor: '$borderSubtle',
        bg: '$surfaceField',
        rounded: model.controlRadius,
      } as const)
    : ({
        py: '$1',
      } as const)

  return (
    <YStack gap={sectionGap}>
      <XStack items="center" justify="space-between">
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
        lineRadius={model.isCyberpunk ? 0 : 999}
        cardProps={editPanelCardBorder}
      >
        {() => (
          <YStack gap={model.isCyberpunk ? '$2' : '$1.5'}>
            {model.orderedQuickActions.map((action) => (
              <XStack
                key={action.id}
                items="center"
                justify="space-between"
                gap="$3"
                {...rowProps}
              >
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
          </YStack>
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
      <YStack
        minH={160 + quickActionClusterInsetTop + quickActionClusterInsetBottom}
        justify="center"
        items="center"
        width="100%"
        height={quickActionClusterHeight + quickActionClusterInsetTop + quickActionClusterInsetBottom}
        pt={quickActionClusterInsetTop}
        pb={quickActionClusterInsetBottom}
      >
        {model.enabledQuickActions.length ? (
          <YStack
            width="100%"
            position="relative"
            minH={160}
            height={quickActionClusterHeight}
          >
            <SortableGrid
              data={model.enabledQuickActions}
              keyExtractor={(item) => item.id}
              columns={model.quickActionColumns}
              itemSize={model.quickActionItemSize}
              gap={model.quickActionGap}
              centerLastRow={model.shouldCenterQuickActionRow}
              layoutVariant={model.isCyberpunk ? 'hexHoneycomb' : 'grid'}
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

const styles = StyleSheet.create({
  hexShell: {
    ...StyleSheet.absoluteFillObject,
    top: 10,
    bottom: 10,
  },
  hexFrame: {
    ...StyleSheet.absoluteFillObject,
  },
})
