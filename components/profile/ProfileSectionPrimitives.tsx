import type { ReactNode } from 'react'
import { Text, XStack } from 'tamagui'

import {
  OptionChip,
  OptionChipLabel,
  ThemedHeadingText,
} from 'components/ui/controls'

export function ProfileSectionTitle({ children }: { children: string }) {
  return (
    <ThemedHeadingText fontWeight="700" fontSize={14}>
      {children}
    </ThemedHeadingText>
  )
}

export function OptionChipList<T extends string>({
  onSelect,
  options,
  selected,
}: {
  onSelect: (value: T) => void
  options: readonly T[]
  selected: T
}) {
  return (
    <XStack gap="$2" flexWrap="wrap">
      {options.map((option) => {
        const isActive = selected === option
        return (
          <OptionChip key={option} active={isActive} onPress={() => onSelect(option)}>
            <OptionChipLabel active={isActive}>{option}</OptionChipLabel>
          </OptionChip>
        )
      })}
    </XStack>
  )
}

export function ProfileInlineLink({ children }: { children: ReactNode }) {
  return (
    <Text fontSize={12} color="$accent">
      {children}
    </Text>
  )
}
