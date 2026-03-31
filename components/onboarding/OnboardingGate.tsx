import type { ReactNode } from 'react'
import { ActivityIndicator } from 'react-native'
import { Text, YStack } from 'tamagui'

import { useOnboardingGateState } from './useOnboardingGateState'

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { showLoading } = useOnboardingGateState()

  return (
    <>
      {children}
      {showLoading ? (
        <YStack
          fullscreen
          bg="$surfacePage"
          items="center"
          justify="center"
          gap="$3"
          style={{ zIndex: 1000 }}
        >
          <ActivityIndicator />
          <Text fontSize={12} color="$textSecondary">
            Preparing your workspace...
          </Text>
        </YStack>
      ) : null}
    </>
  )
}
