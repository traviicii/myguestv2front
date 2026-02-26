import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'
import { LayoutDashboard, Users, User } from '@tamagui/lucide-icons'

export default function TabLayout() {
  const theme = useTheme()
  const accent = theme.accent?.val ?? '#0A0A0A'
  const gray8 = theme.gray8?.val ?? '#334155'
  const background = theme.background?.val ?? '#F8F8F8'
  const color = theme.color?.val ?? '#0A0A0A'

  return (
    // Shared tab + header styling lives here so individual tab screens only
    // manage content/state and not navigation chrome.
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: gray8,
        tabBarStyle: {
          backgroundColor: background,
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: 10,
          height: 64,
          shadowColor: 'rgba(15,23,42,0.12)',
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 12,
          shadowOpacity: 1,
          elevation: 8,
        },
        headerStyle: {
          backgroundColor: background,
          borderBottomWidth: 0,
          height: 48,
        },
        headerTintColor: color,
        headerTitleStyle: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => <Users color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color as any} />,
        }}
      />
    </Tabs>
  )
}
