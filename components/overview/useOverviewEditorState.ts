import { useEffect, useRef, useState } from 'react'
import { Animated as RNAnimated } from 'react-native'

import type { OverviewSectionId } from 'components/state/studioStore'

type UseOverviewEditorStateInput = {
  isFocused: boolean
  sectionOrder: OverviewSectionId[]
  setSectionOrder: (order: OverviewSectionId[]) => void
  showLayoutEditor: boolean
  showQuickActionEditor: boolean
  toggleLayoutEditor: () => void
  visibleSections: OverviewSectionId[]
}

export function useOverviewEditorState({
  isFocused,
  sectionOrder,
  setSectionOrder,
  showLayoutEditor,
  showQuickActionEditor,
  toggleLayoutEditor,
  visibleSections,
}: UseOverviewEditorStateInput) {
  const [layoutDraft, setLayoutDraft] = useState<OverviewSectionId[]>([])
  const layoutAnim = useRef(new RNAnimated.Value(showLayoutEditor ? 1 : 0)).current
  const quickActionHintAnim = useRef(
    new RNAnimated.Value(showQuickActionEditor ? 1 : 0)
  ).current

  useEffect(() => {
    if (showLayoutEditor) {
      setLayoutDraft(visibleSections)
    }
  }, [showLayoutEditor, visibleSections])

  const handleSaveLayout = () => {
    const hiddenSections = sectionOrder.filter((id) => !visibleSections.includes(id))
    setSectionOrder([...layoutDraft, ...hiddenSections])
    toggleLayoutEditor()
  }

  const handleCancelLayout = () => {
    setLayoutDraft(visibleSections)
    toggleLayoutEditor()
  }

  useEffect(() => {
    RNAnimated.timing(layoutAnim, {
      toValue: showLayoutEditor ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [layoutAnim, showLayoutEditor])

  useEffect(() => {
    RNAnimated.timing(quickActionHintAnim, {
      toValue: showQuickActionEditor ? 1 : 0,
      duration: 170,
      useNativeDriver: false,
    }).start()
  }, [quickActionHintAnim, showQuickActionEditor])

  useEffect(() => {
    if (isFocused || !showLayoutEditor) return
    setLayoutDraft(visibleSections)
    toggleLayoutEditor()
  }, [isFocused, showLayoutEditor, toggleLayoutEditor, visibleSections])

  const iconOpacity = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })
  const iconScale = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  })
  const buttonsOpacity = layoutAnim
  const buttonsTranslate = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  })
  const leftTranslate = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  })
  const rightTranslate = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  })

  return {
    buttonsOpacity,
    buttonsTranslate,
    handleCancelLayout,
    handleSaveLayout,
    iconOpacity,
    iconScale,
    layoutAnim,
    layoutDraft,
    leftTranslate,
    quickActionHintAnim,
    rightTranslate,
    setLayoutDraft,
  }
}
