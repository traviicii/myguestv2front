import { Keyboard, InputAccessoryView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from 'tamagui'
import { FALLBACK_COLORS, toNativeColor } from 'components/utils/color'

type KeyboardDismissAccessoryProps = {
  nativeID: string
}

export function KeyboardDismissAccessory({ nativeID }: KeyboardDismissAccessoryProps) {
  const theme = useTheme() as any

  if (Platform.OS !== 'ios') {
    return null
  }

  const backgroundColor = toNativeColor(theme.surfacePanel?.val, FALLBACK_COLORS.surfacePage)
  const borderColor = toNativeColor(theme.surfacePanelBorder?.val, FALLBACK_COLORS.borderSubtle)
  const textColor = toNativeColor(theme.accent?.val, FALLBACK_COLORS.textPrimary)

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor,
            borderTopColor: borderColor,
          },
        ]}
      >
        <Pressable
          onPress={Keyboard.dismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss keyboard"
          style={styles.doneButton}
        >
          <Text style={[styles.doneLabel, { color: textColor }]}>Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  )
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
})
