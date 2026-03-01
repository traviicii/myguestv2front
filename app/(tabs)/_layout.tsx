import { Tabs } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from 'tamagui'
import { LayoutDashboard, Users, User } from '@tamagui/lucide-icons'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'
import { useThemePrefs } from 'components/ThemePrefs'
import { getGlassBlurIntensity, getGlassLayerColors } from 'components/ui/glassStyle'

export default function TabLayout() {
  const theme = useTheme()
  const { aesthetic, mode } = useThemePrefs()
  const isGlass = aesthetic === 'glass'
  const isCyberpunk = aesthetic === 'cyberpunk'
  const activeTint = toNativeColor(
    theme.chromeTintActive?.val,
    toNativeColor(theme.accent?.val, FALLBACK_COLORS.textPrimary)
  )
  const inactiveTint = toNativeColor(
    theme.chromeTintInactive?.val,
    toNativeColor(theme.color?.val, FALLBACK_COLORS.textSecondary)
  )
  const background = toNativeColor(
    theme.chromeBackground?.val,
    toNativeColor(theme.background?.val, FALLBACK_COLORS.surfacePage)
  )
  const color = toNativeColor(
    theme.textPrimary?.val,
    toNativeColor(theme.color?.val, FALLBACK_COLORS.textPrimary)
  )
  const headingFontFamily = aesthetic === 'cyberpunk' ? 'SpaceMono' : 'Inter'
  const shadowColor = toNativeColor(
    isGlass ? theme.surfaceTabGlassShadow?.val : theme.shadowColor?.val,
    isGlass ? FALLBACK_COLORS.shadowGlassStrong : FALLBACK_COLORS.shadowSoft
  )
  const tabInset = isGlass ? 10 : 0
  const tabRadius = isGlass ? 32 : isCyberpunk ? 0 : 0
  const glassColors = getGlassLayerColors(mode, {
    accent: toNativeColor(
      theme.backdropAccent?.val,
      mode === 'dark'
        ? FALLBACK_COLORS.glassAccentDark
        : FALLBACK_COLORS.glassAccentLight
    ),
    start: toNativeColor(
      theme.backdropStart?.val,
      mode === 'dark' ? FALLBACK_COLORS.glassStartDark : FALLBACK_COLORS.glassStartLight
    ),
  })
  const tabBlurIntensity = getGlassBlurIntensity(mode, 'tab')

  return (
    // Shared tab + header styling lives here so individual tab screens only
    // manage content/state and not navigation chrome.
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        headerStatusBarHeight: 0,
        tabBarBackground: isGlass
          ? () => (
              <View style={[StyleSheet.absoluteFillObject, { borderRadius: tabRadius, overflow: 'hidden' }]}>
                <BlurView
                  style={StyleSheet.absoluteFill}
                  intensity={tabBlurIntensity}
                  tint={mode === 'dark' ? 'dark' : 'light'}
                />
                <LinearGradient
                  colors={glassColors.tab}
                  start={{ x: 0.12, y: 0 }}
                  end={{ x: 0.88, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            )
          : undefined,
        tabBarStyle: {
          position: isGlass ? 'absolute' : 'relative',
          left: tabInset,
          right: tabInset,
          bottom: 0,
          borderRadius: tabRadius,
          overflow: isGlass ? 'hidden' : 'visible',
          backgroundColor: isGlass ? 'transparent' : background,
          borderWidth: isGlass ? 0 : 0,
          borderColor: isGlass ? 'transparent' : 'transparent',
          borderTopWidth: 0,
          paddingHorizontal: isGlass ? 10 : 0,
          paddingTop: 6,
          paddingBottom: isGlass ? 10 : 10,
          height: isGlass ? 78 : 64,
          shadowColor,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: isGlass ? 24 : 12,
          shadowOpacity: isGlass ? 0.78 : 1,
          elevation: isGlass ? 12 : 8,
        },
        headerStyle: {
          backgroundColor: background,
          borderBottomWidth: 0,
          height: 48,
        },
        headerTintColor: color,
        headerTitleStyle: {
          fontFamily: headingFontFamily,
          fontSize: 16,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => (
            <LayoutDashboard color={toNativeColor(color, activeTint) as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => (
            <Users color={toNativeColor(color, activeTint) as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User color={toNativeColor(color, activeTint) as any} />
          ),
        }}
      />
    </Tabs>
  )
}
