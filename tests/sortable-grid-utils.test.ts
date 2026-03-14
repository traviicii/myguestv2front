import { expect, test } from '@playwright/test'

import {
  buildSortableGridLayout,
  buildSortableGridPositions,
  getSortableGridOrder,
  getSortableGridPosition,
  haveSortableGridKeysChanged,
  moveSortableGridItem,
  orderSortableGridData,
} from 'components/ui/sortableGridUtils'

test('sortable grid helpers build positions and detect key changes', async () => {
  expect(buildSortableGridPositions(['a', 'b', 'c'])).toEqual({ a: 0, b: 1, c: 2 })
  expect(haveSortableGridKeysChanged(['a', 'b'], ['a', 'b'])).toBe(false)
  expect(haveSortableGridKeysChanged(['a', 'b'], ['b', 'a'])).toBe(true)
})

test('sortable grid helpers compute centered rows and clamp drag order', async () => {
  const layout = buildSortableGridLayout({
    columns: 3,
    itemCount: 5,
    itemSize: 100,
    gap: 10,
  })

  expect(layout.containerWidth).toBe(320)
  expect(layout.containerHeight).toBe(210)
  expect(getSortableGridPosition(3, layout, true)).toEqual({ x: 55, y: 110 })
  expect(getSortableGridPosition(4, layout, true)).toEqual({ x: 165, y: 110 })
  expect(getSortableGridOrder(-20, -20, layout, true)).toBe(0)
  expect(getSortableGridOrder(400, 400, layout, true)).toBe(4)
})

test('sortable grid helpers move items and produce ordered data', async () => {
  const nextPositions = moveSortableGridItem(
    buildSortableGridPositions(['a', 'b', 'c']),
    0,
    2
  )

  expect(nextPositions).toEqual({ a: 2, b: 0, c: 1 })

  const ordered = orderSortableGridData(
    [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    (item) => item.id,
    nextPositions
  )

  expect(ordered.map((item) => item.id)).toEqual(['b', 'c', 'a'])
})
