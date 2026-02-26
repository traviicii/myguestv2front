import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
  dragEnabled?: boolean
  centerLastRow?: boolean
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
  dragEnabled = true,
  centerLastRow = false,
}: SortableGridProps<T>) => {
  const [activeKeyState, setActiveKeyState] = useState<string | null>(null)
  const isDragging = useSharedValue(false)
  const activeKey = useSharedValue<string | null>(null)
  const hasMounted = useSharedValue(false)
  const prevKeysRef = useRef<string[]>([])

  const keys = useMemo(() => data.map((item) => keyExtractor(item)), [data, keyExtractor])
  const initialPositions = useMemo(() => {
    const next: Positions = {}
    keys.forEach((key, index) => {
      next[key] = index
    })
    return next
  }, [keys])
  const positions = useSharedValue<Positions>(initialPositions)
  const rows = Math.max(1, Math.ceil(keys.length / columns))
  const remainder = keys.length % columns
  const cellSize = itemSize + gap
  const containerWidth = columns * itemSize + gap * (columns - 1)
  const containerHeight = rows * itemSize + gap * (rows - 1)
  const lastRowIndex = rows - 1

  useEffect(() => {
    const prevKeys = prevKeysRef.current
    const changed =
      prevKeys.length !== keys.length ||
      prevKeys.some((key, index) => key !== keys[index])
    if (!changed) {
      return
    }
    prevKeysRef.current = keys
    positions.value = initialPositions
  }, [initialPositions, keys, positions])

  useEffect(() => {
    hasMounted.value = true
  }, [hasMounted])

  useEffect(() => {
    if (!dragEnabled) {
      activeKey.value = null
      setActiveKeyState(null)
      isDragging.value = false
      onDragActiveChange?.(false)
    }
  }, [activeKey, dragEnabled, isDragging, onDragActiveChange])

  const getPosition = (index: number) => {
    'worklet'
    const x = (index % columns) * cellSize
    const row = Math.floor(index / columns)
    const rowOffset =
      centerLastRow && remainder > 0 && remainder < columns && row === lastRowIndex
        ? (containerWidth - (remainder * itemSize + gap * (remainder - 1))) / 2
        : 0
    const y = row * cellSize
    return { x: x + rowOffset, y }
  }

  const getOrder = (x: number, y: number) => {
    'worklet'
    const row = clamp(Math.round(y / cellSize), 0, rows - 1)
    const rowColumns =
      centerLastRow && remainder > 0 && remainder < columns && row === lastRowIndex
        ? remainder
        : columns
    const rowOffset =
      centerLastRow && remainder > 0 && remainder < columns && row === lastRowIndex
        ? (containerWidth - (remainder * itemSize + gap * (remainder - 1))) / 2
        : 0
    const col = clamp(Math.round((x - rowOffset) / cellSize), 0, rowColumns - 1)
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
          hasMounted={hasMounted}
          setActiveKeyState={setActiveKeyState}
          isDragging={isDragging}
          dragEnabled={dragEnabled}
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
  hasMounted: Animated.SharedValue<boolean>
  setActiveKeyState: (key: string | null) => void
  isDragging: Animated.SharedValue<boolean>
  dragEnabled: boolean
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
  hasMounted,
  setActiveKeyState,
  isDragging,
  dragEnabled,
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
    .enabled(dragEnabled)
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

  return <GestureDetector gesture={gesture}>{content}</GestureDetector>
})
