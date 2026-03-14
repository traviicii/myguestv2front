import type {
  Positions,
  SortableGridLayout,
  SortableGridLayoutInput,
} from './sortableGridTypes'

export const clamp = (value: number, lower: number, upper: number) => {
  'worklet'
  return Math.max(lower, Math.min(value, upper))
}

export function buildSortableGridPositions(keys: string[]): Positions {
  return keys.reduce((next, key, index) => {
    next[key] = index
    return next
  }, {} as Positions)
}

export function haveSortableGridKeysChanged(prevKeys: string[], nextKeys: string[]) {
  return (
    prevKeys.length !== nextKeys.length ||
    prevKeys.some((key, index) => key !== nextKeys[index])
  )
}

export function buildSortableGridLayout({
  columns,
  itemCount,
  itemSize,
  gap,
}: SortableGridLayoutInput): SortableGridLayout {
  const rows = Math.max(1, Math.ceil(itemCount / columns))
  const remainder = itemCount % columns
  const cellSize = itemSize + gap
  return {
    columns,
    itemCount,
    itemSize,
    gap,
    cellSize,
    rows,
    remainder,
    containerWidth: columns * itemSize + gap * (columns - 1),
    containerHeight: rows * itemSize + gap * (rows - 1),
    lastRowIndex: rows - 1,
  }
}

const getRowOffset = (
  row: number,
  layout: SortableGridLayout,
  centerLastRow: boolean
) => {
  'worklet'
  if (
    !centerLastRow ||
    layout.remainder === 0 ||
    layout.remainder >= layout.columns ||
    row !== layout.lastRowIndex
  ) {
    return 0
  }

  return (
    layout.containerWidth -
    (layout.remainder * layout.itemSize + layout.gap * (layout.remainder - 1))
  ) / 2
}

const getRowColumns = (
  row: number,
  layout: SortableGridLayout,
  centerLastRow: boolean
) => {
  'worklet'
  return centerLastRow &&
    layout.remainder > 0 &&
    layout.remainder < layout.columns &&
    row === layout.lastRowIndex
    ? layout.remainder
    : layout.columns
}

export function getSortableGridPosition(
  index: number,
  layout: SortableGridLayout,
  centerLastRow: boolean
) {
  'worklet'
  const row = Math.floor(index / layout.columns)
  return {
    x: (index % layout.columns) * layout.cellSize + getRowOffset(row, layout, centerLastRow),
    y: row * layout.cellSize,
  }
}

export function getSortableGridOrder(
  x: number,
  y: number,
  layout: SortableGridLayout,
  centerLastRow: boolean
) {
  'worklet'
  const row = clamp(Math.round(y / layout.cellSize), 0, layout.rows - 1)
  const rowOffset = getRowOffset(row, layout, centerLastRow)
  const rowColumns = getRowColumns(row, layout, centerLastRow)
  const col = clamp(Math.round((x - rowOffset) / layout.cellSize), 0, rowColumns - 1)
  return Math.min(row * layout.columns + col, layout.itemCount - 1)
}

export const moveSortableGridItem = (
  positions: Positions,
  from: number,
  to: number
) => {
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

export function orderSortableGridData<T>(
  data: T[],
  keyExtractor: (item: T) => string,
  nextPositions: Positions
) {
  return [...data].sort((a, b) => {
    const aKey = keyExtractor(a)
    const bKey = keyExtractor(b)
    return (nextPositions[aKey] ?? 0) - (nextPositions[bKey] ?? 0)
  })
}
