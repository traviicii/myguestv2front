import { TamaguiProvider, Theme, type TamaguiProviderProps } from 'tamagui'
import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CurrentToast } from './CurrentToast'
import { config } from '../tamagui.config'
import { ThemePrefsProvider, useThemePrefs } from './ThemePrefs'
import { AuthProvider } from './auth/AuthProvider'

// Shared query defaults keep UI snappy while still refreshing in the background.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
})

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, 'config' | 'defaultTheme'>) {
  // Query + theme preference providers sit at the root so every route can
  // read/write cached data and persisted appearance settings.
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemePrefsProvider>
          <ThemedProvider {...rest}>{children}</ThemedProvider>
        </ThemePrefsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function ThemedProvider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, 'config' | 'defaultTheme'>) {
  const { themeName } = useThemePrefs()
  const activeTheme = (
    themeName in config.themes ? themeName : 'studio_light'
  ) as keyof typeof config.themes

  return (
    <TamaguiProvider config={config} defaultTheme={activeTheme} {...rest}>
      <Theme name={activeTheme}>
        <ToastProvider
          swipeDirection="horizontal"
          duration={6000}
          native={[
            // uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go
            // 'mobile'
          ]}
        >
          {children}
          <CurrentToast />
          <ToastViewport top="$8" left={0} right={0} />
        </ToastProvider>
      </Theme>
    </TamaguiProvider>
  )
}
