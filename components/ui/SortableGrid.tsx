import { memo, useEffect, useMemo, useState, type ReactNode } from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

type SortableGridProps<T> = {
  data: T[]
  keyExtractor: (item: T) => string
  renderItem: (item: T, isActive: boolean) => ReactNode
  columns?: number
  itemSize?: number
  gap?: number
  onOrderChange?: (data: T[]) => void
  onDragActiveChange?: (dragging: boolean) => void
}

type Positions = Record<string, number>

const clamp = (value: number, lower: number, upper: number) => {
  'worklet'
  return Math.max(lower, Math.min(value, upper))
}

const moveItem = (positions: Positions, from: number, to: number) => {
  'worklet'
  const next: Positions = { ...positions }
  Object.keys(next).forEach((key) => {
    const position = next[key]
    if (position === from) {
      next[key] = to
      return
    }
    if (from < to && position > from && position <= to) {
      next[key] = position - 1
      return
    }
    if (from > to && position >= to && position < from) {
      next[key] = position + 1
    }
  })
  return next
}

export const SortableGrid = <T,>({
  data,
  keyExtractor,
  renderItem,
  columns = 2,
  itemSize = 160,
  gap = 16,
  onOrderChange,
  onDragActiveChange,
}: SortableGridProps<T>) => {
  const [activeKeyState, setActiveKeyState] = useState<string | null>(null)
  const positions = useSharedValue<Positions>({})
  const isDragging = useSharedValue(false)
  const activeKey = useSharedValue<string | null>(null)

  const keys = useMemo(() => data.map((item) => keyExtractor(item)), [data, keyExtractor])
  const rows = Math.max(1, Math.ceil(keys.length / columns))
  const cellSize = itemSize + gap
  const containerWidth = columns * itemSize + gap * (columns - 1)
  const containerHeight = rows * itemSize + gap * (rows - 1)

  useEffect(() => {
    const nextPositions: Positions = {}
    keys.forEach((key, index) => {
      nextPositions[key] = index
    })
    positions.value = nextPositions
  }, [keys, positions])

  const getPosition = (index: number) => {
    'worklet'
    const x = (index % columns) * cellSize
    const y = Math.floor(index / columns) * cellSize
    return { x, y }
  }

  const getOrder = (x: number, y: number) => {
    'worklet'
    const col = clamp(Math.round(x / cellSize), 0, columns - 1)
    const row = clamp(Math.round(y / cellSize), 0, rows - 1)
    const next = row * columns + col
    return Math.min(next, keys.length - 1)
  }

  const orderData = (nextPositions: Positions) => {
    const ordered = [...data].sort((a, b) => {
      const aKey = keyExtractor(a)
      const bKey = keyExtractor(b)
      return (nextPositions[aKey] ?? 0) - (nextPositions[bKey] ?? 0)
    })
    return ordered
  }

  const handleOrderChange = (nextPositions: Positions) => {
    if (onOrderChange) {
      onOrderChange(orderData(nextPositions))
    }
  }

  return (
    <View style={{ width: containerWidth, height: containerHeight, alignSelf: 'center' }}>
      {data.map((item) => (
        <SortableGridItem
          key={keyExtractor(item)}
          item={item}
          itemKey={keyExtractor(item)}
          renderItem={renderItem}
          positions={positions}
          activeKey={activeKey}
          setActiveKeyState={setActiveKeyState}
          isDragging={isDragging}
          itemSize={itemSize}
          getOrder={getOrder}
          getPosition={getPosition}
          onDragActiveChange={onDragActiveChange}
          onOrderChange={handleOrderChange}
          activeKeyState={activeKeyState}
        />
      ))}
    </View>
  )
}

type SortableItemProps<T> = {
  item: T
  itemKey: string
  renderItem: (item: T, isActive: boolean) => ReactNode
  positions: Animated.SharedValue<Positions>
  activeKey: Animated.SharedValue<string | null>
  setActiveKeyState: (key: string | null) => void
  isDragging: Animated.SharedValue<boolean>
  itemSize: number
  getOrder: (x: number, y: number) => number
  getPosition: (index: number) => { x: number; y: number }
  onOrderChange?: (positions: Positions) => void
  onDragActiveChange?: (dragging: boolean) => void
  activeKeyState: string | null
}

const SortableGridItem = memo(<T,>({
  item,
  itemKey,
  renderItem,
  positions,
  activeKey,
  setActiveKeyState,
  isDragging,
  itemSize,
  getOrder,
  getPosition,
  onOrderChange,
  onDragActiveChange,
  activeKeyState,
}: SortableItemProps<T>) => {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)

  const gesture = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      const position = positions.value[itemKey] ?? 0
      const offset = getPosition(position)
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
      const newOrder = getOrder(translateX.value, translateY.value)
      const oldOrder = positions.value[itemKey] ?? 0
      if (newOrder !== oldOrder) {
        positions.value = moveItem(positions.value, oldOrder, newOrder)
      }
    })
    .onEnd(() => {
      const position = positions.value[itemKey] ?? 0
      const offset = getPosition(position)
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
    const offset = getPosition(position)
    const isActive = activeKey.value === itemKey
    return {
      position: 'absolute',
      width: itemSize,
      height: itemSize,
      zIndex: isActive ? 10 : 0,
      transform: [
        { translateX: isActive ? translateX.value : withSpring(offset.x) },
        { translateY: isActive ? translateY.value : withSpring(offset.y) },
      ],
    }
  })

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {renderItem(item, activeKeyState === itemKey)}
      </Animated.View>
    </GestureDetector>
  )
})
