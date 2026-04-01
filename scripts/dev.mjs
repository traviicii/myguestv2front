import { spawn } from 'node:child_process'

const args = new Set(process.argv.slice(2))
const supportedNodeMajor = 20

const warnIfNodeVersionLooksOff = () => {
  const [major] = process.versions.node.split('.').map(Number)

  if (major === supportedNodeMajor) {
    return
  }

  console.log(
    `Node ${process.versions.node} is installed. Expo SDK 54 is most predictable on Node 20.19.x if you hit odd CLI behavior.`
  )
}

if (args.has('--help')) {
  console.log(`Usage: node scripts/dev.mjs [--localhost | --lan | --tunnel] [--clear]

Starts the MyGuest iPhone development server in dev-client mode.

Options:
  --localhost  Use localhost for the iOS Simulator on this Mac
  --lan        Use the local network host for a same-Wi-Fi iPhone (default)
  --tunnel     Use Expo's tunnel host for off-network or flaky Wi-Fi cases
  --clear      Clear the Metro cache before starting
`)
  process.exit(0)
}

const hostFlags = ['--localhost', '--lan', '--tunnel'].filter((flag) => args.has(flag))

if (hostFlags.length > 1) {
  console.error('Choose only one of --localhost, --lan, or --tunnel.')
  process.exit(1)
}

const host = args.has('--localhost') ? 'localhost' : args.has('--tunnel') ? 'tunnel' : 'lan'
const clear = args.has('--clear')
const expoArgs = ['expo', 'start', '--dev-client', '--host', host, '--scheme', 'myguest']
const env = {
  ...process.env,
  APP_VARIANT: process.env.APP_VARIANT ?? 'development',
  EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN:
    process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN ?? 'false',
  EXPO_TUNNEL_TIMEOUT_MS:
    process.env.EXPO_TUNNEL_TIMEOUT_MS ?? '45000',
}
const appleSignInEnabled = env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === 'true'

warnIfNodeVersionLooksOff()

if (clear) {
  expoArgs.push('-c')
}

console.log(
  host === 'localhost'
    ? 'Starting MyGuest on localhost for the iOS Simulator on this Mac.'
    : host === 'tunnel'
      ? 'Starting MyGuest with a tunnel for the most reliable off-network iPhone path.'
      : 'Starting MyGuest over LAN for a faster same-Wi-Fi iPhone connection.'
)
if (host === 'localhost') {
  console.log('Keep this terminal open, then open MyGuest in the iOS Simulator.')
  console.log('Use `npm run ios` the first time or after native changes install a fresh simulator build.')
} else {
  console.log('Keep this terminal open, then open MyGuest on your iPhone.')
}
if (host === 'tunnel') {
  console.log('Tunnel mode may not auto-list the server in the app. Use "Enter URL manually" with the Metro URL if needed.')
} else if (host === 'lan') {
  console.log('Make sure your Mac and iPhone are on the same Wi-Fi.')
}
if (!appleSignInEnabled) {
  console.log(
    'Local dev defaults Sign in with Apple off so Personal Team iPhone builds can install. Set EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN=true to opt back in.'
  )
}
console.log(
  'If Expo says no development build is installed, run `npm run ios` for the simulator or `npm run ios:device` for a phone first.'
)
console.log('Rebuild native apps only when native dependencies, app config, or signing change.')

const child = spawn('npx', expoArgs, {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

child.on('exit', (code) => {
  if (code && host === 'tunnel') {
    console.log('Tunnel startup failed. Retry with `npm run dev:lan` to use the simpler LAN path.')
  }
  process.exit(code ?? 1)
})
