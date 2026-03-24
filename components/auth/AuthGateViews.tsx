import { ActivityIndicator } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { Text, XStack, YStack } from 'tamagui'

import { PrimaryButton, SecondaryButton } from 'components/ui/controls'

type SignInRequiredViewProps = {
  authError: string | null
  googleProviderLoadError: string | null
  isNativeAuthBlockedInExpoGo: boolean
  isSigningIn: boolean
  loginError: string | null
  missingGoogleClientIds: string[]
  nativeGoogleUnavailable: boolean
  onContinueWithApple: () => Promise<void>
  onContinueWithGoogle: () => Promise<void>
  onOpenPrivacyPolicy: () => Promise<void>
  onOpenSupport: () => Promise<void>
  requestAvailable: boolean
  showAppleSignIn: boolean
  showConfigDetails: boolean
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
  onContinueWithApple,
  onContinueWithGoogle,
  onOpenPrivacyPolicy,
  onOpenSupport,
  requestAvailable,
  showAppleSignIn,
  showConfigDetails,
}: SignInRequiredViewProps) {
  const authMethodsLabel = showAppleSignIn ? 'Apple or Google' : 'Google'

  return (
    <YStack flex={1} px="$6" items="center" justify="center" gap="$4">
      <YStack gap="$2" items="center">
        <Text fontSize={20} fontWeight="700">
          Sign In
        </Text>
        <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
          Use {authMethodsLabel} to securely access your MyGuest workspace.
        </Text>
        <Text fontSize={11} color="$textSecondary" style={{ textAlign: 'center' }}>
          Your sign-in keeps client notes, appointment history, and formulas tied to you.
        </Text>
      </YStack>
      {showAppleSignIn ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={14}
          style={{ width: 220, height: 44, opacity: isSigningIn ? 0.6 : 1 }}
          onPress={() => {
            if (isSigningIn) return
            void onContinueWithApple()
          }}
        />
      ) : null}
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
      <XStack gap="$2" flexWrap="wrap" justify="center">
        <SecondaryButton
          size="$2"
          onPress={() => {
            void onOpenPrivacyPolicy()
          }}
        >
          Privacy Policy
        </SecondaryButton>
        <SecondaryButton
          size="$2"
          onPress={() => {
            void onOpenSupport()
          }}
        >
          Support
        </SecondaryButton>
      </XStack>
      {showConfigDetails && missingGoogleClientIds.length > 0 ? (
        <Text fontSize={11} color="$textSecondary" style={{ textAlign: 'center' }}>
          Missing {missingGoogleClientIds.join(', ')}.
        </Text>
      ) : null}
      {showConfigDetails && isNativeAuthBlockedInExpoGo ? (
        <Text fontSize={11} color="$textSecondary" style={{ textAlign: 'center' }}>
          Native Google sign-in is blocked in Expo Go. Use a development build.
        </Text>
      ) : null}
      {nativeGoogleUnavailable && googleProviderLoadError ? (
        <Text fontSize={11} color="$textSecondary" style={{ textAlign: 'center' }}>
          {showConfigDetails
            ? googleProviderLoadError
            : 'Google sign-in is unavailable in this build right now.'}
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

export function FirebaseConfigRequiredView({
  missingFirebaseConfigKeys,
  onOpenPrivacyPolicy,
  onOpenSupport,
  showPrivacyAction,
  showConfigDetails,
  showSupportAction,
}: {
  missingFirebaseConfigKeys: string[]
  onOpenPrivacyPolicy?: () => Promise<void>
  onOpenSupport?: () => Promise<void>
  showPrivacyAction: boolean
  showConfigDetails: boolean
  showSupportAction: boolean
}) {
  return (
    <YStack flex={1} px="$6" items="center" justify="center" gap="$4">
      <YStack gap="$2" items="center">
        <Text fontSize={18} fontWeight="700">
          {showConfigDetails ? 'Firebase Config Required' : 'Sign-In Unavailable'}
        </Text>
        <Text fontSize={12} color="$textSecondary" style={{ textAlign: 'center' }}>
          {showConfigDetails
            ? 'Add Firebase web config values in `.env` to enable login.'
            : 'This build cannot sign in yet. Please update the app or contact support.'}
        </Text>
      </YStack>
      {showConfigDetails ? (
        <YStack gap="$1.5" width="100%" maxW={520}>
          {missingFirebaseConfigKeys.map((key) => (
            <Text key={key} fontSize={11} color="$textSecondary">
              - {key}
            </Text>
          ))}
        </YStack>
      ) : null}
      {showPrivacyAction || showSupportAction ? (
        <XStack gap="$2" flexWrap="wrap" justify="center">
          {showPrivacyAction && onOpenPrivacyPolicy ? (
            <SecondaryButton
              onPress={() => {
                void onOpenPrivacyPolicy()
              }}
            >
              Privacy Policy
            </SecondaryButton>
          ) : null}
          {showSupportAction && onOpenSupport ? (
            <SecondaryButton
              onPress={() => {
                void onOpenSupport()
              }}
            >
              Contact Support
            </SecondaryButton>
          ) : null}
        </XStack>
      ) : (
        <SecondaryButton disabled>Waiting for sign-in setup</SecondaryButton>
      )}
    </YStack>
  )
}
