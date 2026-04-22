import type { ComponentProps, ReactNode } from 'react'
import { ChevronRight } from '@tamagui/lucide-icons'
import { Text, XStack, YStack } from 'tamagui'

import { SurfaceCard } from './surfaces'
import { ThemedHeadingText } from './typography'

export function InsetSectionHeader({
  action,
  subtitle,
  title,
}: {
  action?: ReactNode
  subtitle?: string
  title: string
}) {
  return (
    <XStack items="flex-start" justify="space-between" gap="$3" px="$1">
      <YStack flex={1} gap="$1">
        <ThemedHeadingText fontWeight="700" fontSize={15}>
          {title}
        </ThemedHeadingText>
        {subtitle ? (
          <Text fontSize={12} color="$textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </YStack>
      {action ? <YStack>{action}</YStack> : null}
    </XStack>
  )
}

export function InsetSectionFooter({
  children,
}: {
  children: ReactNode
}) {
  return (
    <YStack px="$4" pt="$1">
      <Text fontSize={11} color="$textSecondary">
        {children}
      </Text>
    </YStack>
  )
}

export function InsetGroup({
  children,
  tone = 'default',
  ...props
}: ComponentProps<typeof YStack> & { tone?: 'default' | 'secondary' | 'tabGlass' }) {
  return (
    <SurfaceCard
      mode="panel"
      tone={tone}
      p="$0"
      gap="$0"
      overflow="hidden"
      {...props}
    >
      {children}
    </SurfaceCard>
  )
}

export function InsetRow({
  danger = false,
  detail,
  icon,
  onPress,
  showChevron,
  showSeparator = true,
  subtitle,
  testID,
  title,
  trailing,
}: {
  danger?: boolean
  detail?: string
  icon?: ReactNode
  onPress?: () => void
  showChevron?: boolean
  showSeparator?: boolean
  subtitle?: string
  testID?: string
  title: string
  trailing?: ReactNode
}) {
  const labelColor = danger ? '$danger' : '$textPrimary'
  const showRowChevron = showChevron ?? Boolean(onPress)

  return (
    <YStack
      testID={testID}
      px="$4"
      py="$3"
      gap="$0.5"
      borderBottomWidth={showSeparator ? 1 : 0}
      borderBottomColor="$divider"
      pressStyle={onPress ? { opacity: 0.94, scale: 0.995 } : undefined}
      onPress={onPress}
    >
      <XStack items="center" gap="$3">
        {icon ? (
          <YStack width={24} items="center" justify="center">
            {icon}
          </YStack>
        ) : null}

        <YStack flex={1} minW={0} gap="$0.5">
          <XStack items="center" gap="$2" justify="space-between">
            <Text fontSize={14} fontWeight="600" color={labelColor}>
              {title}
            </Text>
            {detail ? (
              <Text fontSize={12} color="$textSecondary" numberOfLines={1}>
                {detail}
              </Text>
            ) : null}
          </XStack>
          {subtitle ? (
            <Text fontSize={12} color="$textSecondary">
              {subtitle}
            </Text>
          ) : null}
        </YStack>

        {trailing ?? (showRowChevron ? <ChevronRight size={16} color="$textMuted" /> : null)}
      </XStack>
    </YStack>
  )
}
