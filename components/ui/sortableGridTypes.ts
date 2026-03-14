import type { ReactNode } from 'react'

export type SortableGridProps<T> = {
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

export type Positions = Record<string, number>

export type SortableGridLayoutInput = {
  columns: number
  itemCount: number
  itemSize: number
  gap: number
}

export type SortableGridLayout = SortableGridLayoutInput & {
  cellSize: number
  rows: number
  remainder: number
  containerWidth: number
  containerHeight: number
  lastRowIndex: number
}
