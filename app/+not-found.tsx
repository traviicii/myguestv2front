import { Link, Stack } from 'expo-router'
import { StyleSheet } from 'react-native'
import { View, Text } from 'tamagui'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View m={10}>
        <Text>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text fontSize={14} color="$accent">
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
})
