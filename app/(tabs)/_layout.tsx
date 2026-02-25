import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'
import { LayoutDashboard, Users, User } from '@tamagui/lucide-icons'

export default function TabLayout() {
  const theme = useTheme()

  return (
    // Shared tab + header styling lives here so individual tab screens only
    // manage content/state and not navigation chrome.
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent.val,
        tabBarInactiveTintColor: theme.gray8.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
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
          backgroundColor: theme.background.val,
          borderBottomWidth: 0,
          height: 48,
        },
        headerTintColor: theme.color.val,
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
