import { spawn, spawnSync } from 'node:child_process'
import { buildManualUrls } from './devUrlUtils.mjs'

const args = new Set(process.argv.slice(2))
const supportedNodeMajor = 20
const tunnelRetryPatterns = [
  /ECONNREFUSED 127\.0\.0\.1:4040/,
  /ngrok tunnel took too long to connect/i,
]
const watcherLimitPattern = /EMFILE: too many open files, watch/i
const maxTunnelRetries = 3
const tunnelRetryDelayMs = 1500

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
const env = {
  ...process.env,
  APP_VARIANT: process.env.APP_VARIANT ?? 'development',
  EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN:
    process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN ?? 'false',
  EXPO_TUNNEL_TIMEOUT_MS:
    process.env.EXPO_TUNNEL_TIMEOUT_MS ?? '45000',
}
const appleSignInEnabled = env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === 'true'
const resolveAppScheme = () => {
  const appVariant = (env.APP_VARIANT ?? 'development').trim().toLowerCase()
  return appVariant === 'development' ? 'myguest-dev' : 'myguest'
}
const appScheme = resolveAppScheme()
const expoArgs = ['expo', 'start', '--dev-client', '--host', host, '--scheme', appScheme]

const copyToClipboard = (value) => {
  if (!value || process.platform !== 'darwin') {
    return false
  }

  const result = spawnSync('pbcopy', [], {
    input: value,
    stdio: ['pipe', 'ignore', 'ignore'],
  })

  return !result.error && result.status === 0
}

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
console.log(`Using dev-client scheme: ${appScheme}`)
console.log('Rebuild native apps only when native dependencies, app config, or signing change.')

const manualUrls = buildManualUrls({ host, scheme: appScheme })
if (manualUrls) {
  console.log('Manual fallback URLs:')
  console.log(`  Metro: ${manualUrls.metroBase}`)
  console.log(`  Dev client: ${manualUrls.devClientUrl}`)
  console.log('If the app says no development servers were found, unlock the phone and try the dev-client URL first.')
  if (host === 'lan' && copyToClipboard(manualUrls.devClientUrl)) {
    console.log('Copied the LAN dev-client URL to your clipboard.')
  }
} else if (host === 'tunnel') {
  console.log('Tunnel fallback URL will come from Expo after the tunnel finishes connecting.')
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const startExpoProcess = () => {
  const child = spawn('npx', expoArgs, {
    env,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })

  let output = ''
  child.stdout?.on('data', (chunk) => {
    const text = chunk.toString()
    output = `${output}${text}`.slice(-20_000)
    process.stdout.write(chunk)
  })
  child.stderr?.on('data', (chunk) => {
    const text = chunk.toString()
    output = `${output}${text}`.slice(-20_000)
    process.stderr.write(chunk)
  })

  return {
    child,
    getOutput: () => output,
  }
}

const runWithTunnelRetry = async () => {
  let attempt = 1

  while (true) {
    const { child, getOutput } = startExpoProcess()
    const exitCode = await new Promise((resolve) => {
      child.on('exit', (code, signal) => {
        if (signal === 'SIGINT') {
          resolve(0)
          return
        }
        resolve(code ?? 1)
      })
    })

    const shouldRetry =
      host === 'tunnel' &&
      exitCode !== 0 &&
      attempt < maxTunnelRetries &&
      tunnelRetryPatterns.some((pattern) => pattern.test(getOutput()))

    if (!shouldRetry) {
      if (exitCode) {
        const output = getOutput()

        if (watcherLimitPattern.test(output)) {
          console.log(
            'Metro hit the macOS file-watcher limit before it could stay up.'
          )
          console.log(
            'Run `npm run dev:watchman:reset`, then start `npm run dev` again.'
          )
          console.log(
            'If that still fails, stop any duplicate Metro terminals before retrying.'
          )
        } else if (host === 'tunnel') {
          console.log(
            'Tunnel startup failed. Retry with `npm run dev:lan` to use the simpler LAN path.'
          )
        }
      }
      process.exit(exitCode)
    }

    attempt += 1
    console.log(
      `Tunnel startup hit Expo's local ngrok race. Retrying automatically (${attempt}/${maxTunnelRetries})...`
    )
    await delay(tunnelRetryDelayMs)
  }
}

await runWithTunnelRetry()
