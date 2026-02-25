import '../tamagui.generated.css'

import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'components/Provider'
import { useTheme } from 'tamagui'
import { useThemePrefs } from 'components/ThemePrefs'

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
  const { mode } = useThemePrefs()
  return (
    <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {/* Central navigation map for all top-level routes and modals. */}
      <Stack
        screenOptions={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
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
            headerBackTitle: 'Clients',
          }}
        />

        <Stack.Screen
          name="client/[id]/new-appointment"
          options={{
            title: 'New Appointment Log',
            headerBackTitle: 'Client',
          }}
        />

        <Stack.Screen
          name="client/[id]/edit"
          options={{
            title: 'Edit Client',
            headerBackTitle: 'Client',
          }}
        />

        <Stack.Screen
          name="clients/new"
          options={{
            title: 'New Client',
            headerBackTitle: 'Clients',
          }}
        />

        <Stack.Screen
          name="appointments"
          options={{
            title: 'Appointment History',
            headerBackTitle: 'Overview',
          }}
        />

        <Stack.Screen
          name="appointments/new"
          options={{
            title: 'New Appointment Log',
            headerBackTitle: 'Overview',
          }}
        />

        <Stack.Screen
          name="recent-clients"
          options={{
            title: 'Recent Clients',
            headerBackTitle: 'Overview',
          }}
        />

        <Stack.Screen
          name="appointment/[id]"
          options={{
            title: 'Appointment',
            headerBackTitle: 'History',
          }}
        />

        <Stack.Screen
          name="appointment/[id]/edit"
          options={{
            title: 'Edit Appointment Log',
            headerBackTitle: 'Appointment',
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: 'App Settings',
            headerBackTitle: 'Profile',
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
              backgroundColor: theme.background.val,
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}
