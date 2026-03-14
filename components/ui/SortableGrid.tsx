import { useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

import { SortableGridItem } from './SortableGridItem'
import type { Positions, SortableGridProps } from './sortableGridTypes'
import {
  buildSortableGridLayout,
  buildSortableGridPositions,
  haveSortableGridKeysChanged,
  orderSortableGridData,
} from './sortableGridUtils'

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
  const initialPositions = useMemo(() => buildSortableGridPositions(keys), [keys])
  const positions = useSharedValue<Positions>(initialPositions)
  const layout = useMemo(
    () =>
      buildSortableGridLayout({
        columns,
        itemCount: keys.length,
        itemSize,
        gap,
      }),
    [columns, gap, itemSize, keys.length]
  )

  useEffect(() => {
    const prevKeys = prevKeysRef.current
    if (!haveSortableGridKeysChanged(prevKeys, keys)) {
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

  const handleOrderChange = (nextPositions: Positions) => {
    if (!onOrderChange) {
      return
    }
    onOrderChange(orderSortableGridData(data, keyExtractor, nextPositions))
  }

  return (
    <View
      style={{
        width: layout.containerWidth,
        height: layout.containerHeight,
        alignSelf: 'center',
      }}
    >
      {data.map((item) => {
        const itemKey = keyExtractor(item)
        return (
          <SortableGridItem
            key={itemKey}
            item={item}
            itemKey={itemKey}
            renderItem={renderItem}
            positions={positions}
            activeKey={activeKey}
            hasMounted={hasMounted}
            setActiveKeyState={setActiveKeyState}
            isDragging={isDragging}
            dragEnabled={dragEnabled}
            itemSize={itemSize}
            layout={layout}
            centerLastRow={centerLastRow}
            onDragActiveChange={onDragActiveChange}
            onOrderChange={handleOrderChange}
            activeKeyState={activeKeyState}
          />
        )
      })}
    </View>
  )
}
