import { Text, XStack, YStack } from 'tamagui'

type ClientAlphabetSectionHeaderProps = {
  letter: string
}

export function ClientAlphabetSectionHeader({ letter }: ClientAlphabetSectionHeaderProps) {
  return (
    <YStack accessibilityRole="header" px="$5" pt="$2.5" pb="$1.5">
      <XStack items="center" gap="$2.5">
        <Text
          color="$accent"
          fontSize={12}
          fontWeight="800"
          letterSpacing={1.2}
          width={18}
        >
          {letter}
        </Text>
        <XStack flex={1} height={1} bg="$borderSubtle" opacity={0.5} />
      </XStack>
    </YStack>
  )
}
