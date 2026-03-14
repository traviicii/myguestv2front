import { ActivityIndicator } from 'react-native'
import { Text, YStack } from 'tamagui'

import { PrimaryButton, SecondaryButton } from 'components/ui/controls'

type SignInRequiredViewProps = {
  authError: string | null
  googleProviderLoadError: string | null
  isNativeAuthBlockedInExpoGo: boolean
  isSigningIn: boolean
  loginError: string | null
  missingGoogleClientIds: string[]
  nativeGoogleUnavailable: boolean
  onContinueWithGoogle: () => Promise<void>
  requestAvailable: boolean
}

export function AuthLoadingState() {
  return (
    <YStack flex={1} items="center" justify="center" gap="$3">
      <ActivityIndicator />
      <Text fontSize={12} color="$textSecondary">
        Checking session...
      </Text>
    </YStack>
  )
}

export function SignInRequiredView({
  authError,
  googleProviderLoadError,
  isNativeAuthBlockedInExpoGo,
  isSigningIn,
  loginError,
  missingGoogleClientIds,
  nativeGoogleUnavailable,
  onContinueWithGoogle,
  requestAvailable,
}: SignInRequiredViewProps) {
  return (
    <YStack flex={1} px="$6" items="center" justify="center" gap="$4">
      <YStack gap="$2" items="center">
        <Text fontSize={20} fontWeight="700">
          Sign In
        </Text>
        <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
          Use your Google account to access your MyGuest v2 data.
        </Text>
      </YStack>
      <PrimaryButton
        width={220}
        disabled={
          isSigningIn ||
          (!requestAvailable && missingGoogleClientIds.length === 0)
        }
        onPress={() => {
          void onContinueWithGoogle()
        }}
      >
        <Text color="$accentContrast" fontWeight="600">
          {isSigningIn ? 'Signing In...' : 'Continue With Google'}
        </Text>
      </PrimaryButton>
      {missingGoogleClientIds.length > 0 ? (
        <Text fontSize={11} color="$textSecondary" style={{ textAlign: 'center' }}>
          Missing {missingGoogleClientIds.join(', ')}.
        </Text>
      ) : null}
      {isNativeAuthBlockedInExpoGo ? (
        <Text fontSize={11} color="$textSecondary" style={{ textAlign: 'center' }}>
          Native Google sign-in is blocked in Expo Go. Use a development build.
        </Text>
      ) : null}
      {nativeGoogleUnavailable && googleProviderLoadError ? (
        <Text fontSize={11} color="$textSecondary" style={{ textAlign: 'center' }}>
          {googleProviderLoadError}
        </Text>
      ) : null}
      {loginError || authError ? (
        <Text fontSize={11} color="$red10" style={{ textAlign: 'center' }}>
          {loginError || authError}
        </Text>
      ) : null}
    </YStack>
  )
}

export function FirebaseConfigRequiredView({ missingFirebaseConfigKeys }: { missingFirebaseConfigKeys: string[] }) {
  return (
    <YStack flex={1} px="$6" items="center" justify="center" gap="$4">
      <YStack gap="$2" items="center">
        <Text fontSize={18} fontWeight="700">
          Firebase Config Required
        </Text>
        <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
          Add Firebase web config values in `.env` to enable login.
        </Text>
      </YStack>
      <YStack gap="$1.5" width="100%" maxW={520}>
        {missingFirebaseConfigKeys.map((key) => (
          <Text key={key} fontSize={11} color="$textSecondary">
            - {key}
          </Text>
        ))}
      </YStack>
      <SecondaryButton disabled>Waiting for Firebase env vars</SecondaryButton>
    </YStack>
  )
}
