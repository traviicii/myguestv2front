import type { ComponentProps } from 'react'

import { Link } from 'expo-router'
import { Text, XStack, YStack } from 'tamagui'

import {
  PrimaryButton,
  SurfaceCard,
  cardSurfaceProps,
} from 'components/ui/controls'

import type {
  ClientAppointmentActionLinkProps,
  ClientDetailSectionProps,
  QuickActionConfig,
} from './sectionTypes'

export function ClientDetailCard({
  model,
  children,
  ...props
}: ClientDetailSectionProps & ComponentProps<typeof YStack>) {
  if (model.isGlass) {
    return (
      <SurfaceCard mode="alwaysCard" tone="secondary" gap="$0" {...props}>
        {children}
      </SurfaceCard>
    )
  }

  return <YStack {...cardSurfaceProps} {...props}>{children}</YStack>
}

export function ClientDetailSectionTitle({ children }: { children: string }) {
  return (
    <Text fontFamily="$heading" fontWeight="600" fontSize={14} color="$color">
      {children}
    </Text>
  )
}

export function ActionText({ label }: { label: string }) {
  return (
    <Text fontSize={12} color="$accent">
      {label}
    </Text>
  )
}

export function ClientQuickActionButton({
  model,
  action,
}: ClientDetailSectionProps & { action: QuickActionConfig }) {
  if (model.isGlass) {
    return (
      <PrimaryButton
        size="$2"
        height={36}
        px="$3"
        flex={1}
        icon={action.icon}
        disabled={!action.url}
        opacity={action.url ? 1 : 0.4}
        onPress={() => model.openExternal(action.url)}
      >
        {action.label}
      </PrimaryButton>
    )
  }

  return (
    <ClientDetailCard
      model={model}
      rounded={model.controlRadius}
      px="$3"
      py="$2.5"
      flex={1}
      opacity={action.url ? 1 : 0.4}
      onPress={() => model.openExternal(action.url)}
    >
      <XStack items="center" gap="$2">
        {action.icon}
        <ActionText label={action.label} />
      </XStack>
    </ClientDetailCard>
  )
}

export function ClientAppointmentActionLink({
  children,
  href,
}: ClientAppointmentActionLinkProps) {
  return (
    <Link href={href} asChild>
      {children}
    </Link>
  )
}

export function ClientDetailStateMessage({ message }: { message: string }) {
  return (
    <YStack flex={1} items="center" justify="center">
      <Text fontSize={13} color="$textSecondary">
        {message}
      </Text>
    </YStack>
  )
}
