import '../tamagui.generated.css'

import { useEffect } from 'react'
import { ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AuthGate } from 'components/auth/AuthGate'
import { RootProviders } from 'components/navigation/RootProviders'
import { getRootStackScreens } from 'components/navigation/RootStackScreens'
import { rootLayoutFonts } from 'components/navigation/rootLayoutFonts'
import { useRootLayoutTheme } from 'components/navigation/rootLayoutTheme'
import { OnboardingGate } from 'components/onboarding/OnboardingGate'

export {
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(rootLayoutFonts)

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontError, fontsLoaded])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootProviders>
        <RootLayoutNav />
      </RootProviders>
    </GestureHandlerRootView>
  )
}

function RootLayoutNav() {
  const { chromeBackground, chromeTint, headingFontFamily, navigationTheme, pageBackground } =
    useRootLayoutTheme()

  return (
    <ThemeProvider value={navigationTheme}>
      <AuthGate>
        <OnboardingGate>
          <Stack
            screenOptions={{
              animation: 'none',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              headerBackTitle: '',
              headerBackButtonDisplayMode: 'minimal',
              headerStyle: {
                backgroundColor: chromeBackground,
              },
              headerShadowVisible: false,
              headerTintColor: chromeTint,
              headerTitleStyle: {
                fontFamily: headingFontFamily,
                fontSize: 16,
                fontWeight: '600',
              },
              contentStyle: {
                backgroundColor: pageBackground,
              },
            }}
          >
            {getRootStackScreens({ pageBackground })}
          </Stack>
        </OnboardingGate>
      </AuthGate>
    </ThemeProvider>
  )
}
