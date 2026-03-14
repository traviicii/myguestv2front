import { memo, type ReactNode } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import type { Positions, SortableGridLayout } from './sortableGridTypes'
import {
  getSortableGridOrder,
  getSortableGridPosition,
  moveSortableGridItem,
} from './sortableGridUtils'

type SortableGridItemProps<T> = {
  item: T
  itemKey: string
  renderItem: (item: T, isActive: boolean) => ReactNode
  positions: SharedValue<Positions>
  activeKey: SharedValue<string | null>
  hasMounted: SharedValue<boolean>
  setActiveKeyState: (key: string | null) => void
  isDragging: SharedValue<boolean>
  dragEnabled: boolean
  itemSize: number
  layout: SortableGridLayout
  centerLastRow: boolean
  onOrderChange?: (positions: Positions) => void
  onDragActiveChange?: (dragging: boolean) => void
  activeKeyState: string | null
}

const SortableGridItemInner = <T,>({
  item,
  itemKey,
  renderItem,
  positions,
  activeKey,
  hasMounted,
  setActiveKeyState,
  isDragging,
  dragEnabled,
  itemSize,
  layout,
  centerLastRow,
  onOrderChange,
  onDragActiveChange,
  activeKeyState,
}: SortableGridItemProps<T>) => {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)

  const gesture = Gesture.Pan()
    .enabled(dragEnabled)
    .minDistance(1)
    .onBegin(() => {
      const position = positions.value[itemKey] ?? 0
      const offset = getSortableGridPosition(position, layout, centerLastRow)
      translateX.value = offset.x
      translateY.value = offset.y
      startX.value = offset.x
      startY.value = offset.y
      activeKey.value = itemKey
      runOnJS(setActiveKeyState)(itemKey)
      if (!isDragging.value) {
        isDragging.value = true
        if (onDragActiveChange) {
          runOnJS(onDragActiveChange)(true)
        }
      }
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX
      translateY.value = startY.value + event.translationY
      const newOrder = getSortableGridOrder(
        translateX.value,
        translateY.value,
        layout,
        centerLastRow
      )
      const oldOrder = positions.value[itemKey] ?? 0
      if (newOrder !== oldOrder) {
        positions.value = moveSortableGridItem(positions.value, oldOrder, newOrder)
      }
    })
    .onEnd(() => {
      const position = positions.value[itemKey] ?? 0
      const offset = getSortableGridPosition(position, layout, centerLastRow)
      translateX.value = withSpring(offset.x)
      translateY.value = withSpring(offset.y)
      activeKey.value = null
      runOnJS(setActiveKeyState)(null)
      if (isDragging.value) {
        isDragging.value = false
        if (onDragActiveChange) {
          runOnJS(onDragActiveChange)(false)
        }
      }
      if (onOrderChange) {
        runOnJS(onOrderChange)(positions.value)
      }
    })

  const animatedStyle = useAnimatedStyle(() => {
    const position = positions.value[itemKey] ?? 0
    const offset = getSortableGridPosition(position, layout, centerLastRow)
    const isActive = activeKey.value === itemKey
    const useSpring = hasMounted.value && !isActive
    return {
      position: 'absolute',
      width: itemSize,
      height: itemSize,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: isActive ? 10 : 0,
      transform: [
        {
          translateX: isActive
            ? translateX.value
            : useSpring
              ? withSpring(offset.x)
              : offset.x,
        },
        {
          translateY: isActive
            ? translateY.value
            : useSpring
              ? withSpring(offset.y)
              : offset.y,
        },
      ],
    }
  })

  const content = (
    <Animated.View style={animatedStyle}>
      {renderItem(item, activeKeyState === itemKey)}
    </Animated.View>
  )

  if (!dragEnabled) {
    return content
  }

  return <GestureDetector gesture={gesture}>{content}</GestureDetector>
}

export const SortableGridItem = memo(SortableGridItemInner) as typeof SortableGridItemInner
