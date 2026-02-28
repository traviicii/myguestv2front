import '../tamagui.generated.css'

import { useEffect, useMemo } from 'react'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'components/Provider'
import { useTheme } from 'tamagui'
import { useThemePrefs } from 'components/ThemePrefs'
import { AuthGate } from 'components/auth/AuthGate'
import { toNativeColor } from 'components/utils/color'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Providers>
        <RootLayoutNav />
      </Providers>
    </GestureHandlerRootView>
  )
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  // Keep provider composition in one place so route files stay focused on UI.
  return <Provider>{children}</Provider>
}

function RootLayoutNav() {
  const theme = useTheme()
  const { mode, aesthetic } = useThemePrefs()
  const pageBackground = toNativeColor(theme.surfacePage?.val, '#F8F8F8')
  const chromeBackground = toNativeColor(theme.chromeBackground?.val, '#F8F8F8')
  const chromeTint = toNativeColor(theme.textPrimary?.val, '#0A0A0A')
  const headingFontFamily = aesthetic === 'cyberpunk' ? 'SpaceMono' : 'Inter'
  const navigationTheme = useMemo(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme
    const primary = toNativeColor(theme.accent?.val, base.colors.primary)
    const border = toNativeColor(theme.surfacePanelBorder?.val, base.colors.border)
    return {
      ...base,
      dark: mode === 'dark',
      colors: {
        ...base.colors,
        primary,
        background: pageBackground,
        card: chromeBackground,
        border,
        text: chromeTint,
        notification: primary,
      },
    }
  }, [chromeBackground, chromeTint, mode, pageBackground, theme.accent?.val, theme.surfacePanelBorder?.val])

  return (
    <ThemeProvider value={navigationTheme}>
      <AuthGate>
        {/* Central navigation map for all top-level routes and modals. */}
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
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="client/[id]"
            options={{
              title: 'Client Details',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="client/[id]/new-appointment"
            options={{
              title: 'New Appointment Log',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="client/[id]/edit"
            options={{
              title: 'Edit Client',
            }}
          />

          <Stack.Screen
            name="client/[id]/color-chart/index"
            options={{
              title: 'Color Chart',
            }}
          />

          <Stack.Screen
            name="client/[id]/color-chart/edit"
            options={{
              title: 'Edit Color Chart',
            }}
          />

          <Stack.Screen
            name="clients/new"
            options={{
              title: 'New Client',
            }}
          />

          <Stack.Screen
            name="appointments"
            options={{
              title: 'Appointment History',
            }}
          />

          <Stack.Screen
            name="appointments/new"
            options={{
              title: 'New Appointment Log',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="recent-clients"
            options={{
              title: 'Recent Clients',
            }}
          />

          <Stack.Screen
            name="appointment/[id]"
            options={{
              title: 'Appointment',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="appointment/[id]/edit"
            options={{
              title: 'Edit Appointment Log',
            }}
          />

          <Stack.Screen
            name="settings"
            options={{
              title: 'App Settings',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="modal"
            options={{
              title: 'Tamagui + Expo',
              presentation: 'modal',
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              contentStyle: {
                backgroundColor: pageBackground,
              },
            }}
          />
        </Stack>
      </AuthGate>
    </ThemeProvider>
  )
}
