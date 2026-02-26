import { useState, type ReactNode } from 'react'
import { ActivityIndicator } from 'react-native'
import { Text, YStack } from 'tamagui'
import { PrimaryButton, SecondaryButton } from 'components/ui/controls'
import { hasStaticDevToken } from 'components/data/api'
import { useAuth } from './AuthProvider'

export function AuthGate({ children }: { children: ReactNode }) {
  const {
    isReady,
    user,
    canUseFirebaseAuth,
    missingFirebaseConfigKeys,
    authError,
    signInWithGoogle,
  } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const canUseDevTokenFallback = hasStaticDevToken()

  if (canUseFirebaseAuth) {
    if (!isReady) {
      return (
        <YStack flex={1} items="center" justify="center" gap="$3">
          <ActivityIndicator />
          <Text fontSize={12} color="$gray8">
            Checking session...
          </Text>
        </YStack>
      )
    }

    if (user) {
      return <>{children}</>
    }

    return (
      <YStack flex={1} px="$6" items="center" justify="center" gap="$4">
        <YStack gap="$2" items="center">
          <Text fontSize={20} fontWeight="700">
            Sign In
          </Text>
          <Text fontSize={12} color="$gray8" style={{ textAlign: 'center' }}>
            Use your Google account to access your MyGuest v2 data.
          </Text>
        </YStack>
        <PrimaryButton
          width={220}
          disabled={isSigningIn}
          onPress={async () => {
            setLoginError(null)
            setIsSigningIn(true)
            try {
              await signInWithGoogle()
            } catch (error) {
              setLoginError(
                error instanceof Error ? error.message : 'Unable to sign in right now.'
              )
            } finally {
              setIsSigningIn(false)
            }
          }}
        >
          {isSigningIn ? 'Signing In...' : 'Continue With Google'}
        </PrimaryButton>
        {loginError || authError ? (
          <Text fontSize={11} color="$red10" style={{ textAlign: 'center' }}>
            {loginError || authError}
          </Text>
        ) : null}
      </YStack>
    )
  }

  if (canUseDevTokenFallback) {
    return <>{children}</>
  }

  return (
    <YStack flex={1} px="$6" items="center" justify="center" gap="$4">
      <YStack gap="$2" items="center">
        <Text fontSize={18} fontWeight="700">
          Firebase Config Required
        </Text>
        <Text fontSize={12} color="$gray8" style={{ textAlign: 'center' }}>
          Add Firebase web config values in `.env` to enable login.
        </Text>
      </YStack>
      <YStack gap="$1.5" width="100%" maxW={520}>
        {missingFirebaseConfigKeys.map((key) => (
          <Text key={key} fontSize={11} color="$gray8">
            - {key}
          </Text>
        ))}
      </YStack>
      <SecondaryButton disabled>
        Waiting for Firebase env vars
      </SecondaryButton>
    </YStack>
  )
}
