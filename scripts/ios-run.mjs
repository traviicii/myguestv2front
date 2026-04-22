import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildManualUrls } from './devUrlUtils.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const projectRoot = path.resolve(scriptDir, '..')
const iosDir = path.join(projectRoot, 'ios')
const xcodeBuildLogPath = path.join(projectRoot, '.expo', 'xcodebuild.log')
const expoPrebuildCachePath = path.join(
  projectRoot,
  '.expo',
  'prebuild',
  'cached-packages.json'
)
const supportedNodeMajor = 20
const baseExpoConfig = require(path.join(projectRoot, 'app.config.base.js'))

const args = new Set(process.argv.slice(2))

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
  console.log(`Usage: node scripts/ios-run.mjs [--device | --simulator] [--clean]

Builds the MyGuest iOS development app for either the simulator or a physical iPhone.

Options:
  --simulator  Build for the iOS Simulator (default)
  --device     Build for a connected iPhone
  --clean      Regenerate native projects before building
`)
  process.exit(0)
}

const targetFlags = ['--device', '--simulator'].filter((flag) => args.has(flag))

if (targetFlags.length > 1) {
  console.error('Choose either --device or --simulator, not both.')
  process.exit(1)
}

const target = args.has('--device') ? 'device' : 'simulator'
const clean = args.has('--clean')
const env = {
  ...process.env,
  APP_VARIANT: process.env.APP_VARIANT ?? 'development',
  EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN:
    process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN ?? 'false',
}
const appleSignInEnabled = env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === 'true'
const lanManualUrls = target === 'device' ? buildManualUrls({ host: 'lan', scheme: 'myguest' }) : null

warnIfNodeVersionLooksOff()

const sanitizeNativeProjectName = (value) => value.replace(/[^A-Za-z0-9]/g, '')
const resolveAppVariant = () => {
  const requestedVariant = (env.APP_VARIANT ?? 'development').trim().toLowerCase()
  return ['development', 'preview', 'production'].includes(requestedVariant)
    ? requestedVariant
    : 'production'
}
const resolveNativeProjectDisplayName = (baseName) => {
  const appVariant = resolveAppVariant()

  if (appVariant === 'development') {
    return `${baseName} Dev`
  }
  if (appVariant === 'preview') {
    return `${baseName} Preview`
  }
  return baseName
}
const resolveNativeProjectName = (baseName) =>
  sanitizeNativeProjectName(resolveNativeProjectDisplayName(baseName))
const resolveBaseAppName = () => baseExpoConfig.name ?? 'App'
const resolveNativeProjectFilePath = () =>
  path.join(
    iosDir,
    `${resolveNativeProjectName(resolveBaseAppName())}.xcodeproj`,
    'project.pbxproj'
  )

const pruneStaleWorkspaces = async () => {
  const baseAppName = resolveBaseAppName()
  const baseProjectName = sanitizeNativeProjectName(baseAppName)
  const expectedProjectName = resolveNativeProjectName(baseAppName)
  const expectedNames = new Set([
    expectedProjectName,
    `${expectedProjectName}.xcodeproj`,
    `${expectedProjectName}.xcworkspace`,
  ])

  let entries
  try {
    entries = await readdir(iosDir, { withFileTypes: true })
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return
    }
    throw error
  }

  for (const entry of entries) {
    const isNativeProjectArtifact =
      entry.isDirectory() &&
      (entry.name === baseProjectName ||
        entry.name.endsWith('.xcodeproj') ||
        entry.name.endsWith('.xcworkspace'))

    if (!isNativeProjectArtifact || !entry.name.startsWith(baseProjectName)) {
      continue
    }

    if (expectedNames.has(entry.name)) {
      continue
    }

    await rm(path.join(iosDir, entry.name), { recursive: true, force: true })
    console.log(`Removed stale native artifact: ${entry.name}`)
  }
}

const stripAppleSignInEntitlement = async () => {
  if (appleSignInEnabled) {
    return
  }

  const projectName = resolveNativeProjectName(resolveBaseAppName())
  const entitlementsPath = path.join(iosDir, projectName, `${projectName}.entitlements`)

  let entitlements
  try {
    entitlements = await readFile(entitlementsPath, 'utf8')
  } catch {
    return
  }

  const nextEntitlements = entitlements.replace(
    /\s*<key>com\.apple\.developer\.applesignin<\/key>\s*<array>\s*<string>Default<\/string>\s*<\/array>\s*/m,
    '\n'
  )

  if (nextEntitlements === entitlements) {
    return
  }

  await writeFile(entitlementsPath, nextEntitlements)
  console.log(`Removed Sign in with Apple entitlement from ${path.relative(projectRoot, entitlementsPath)}`)
}

const repairExpoPrebuildCacheFile = async () => {
  let contents
  try {
    contents = await readFile(expoPrebuildCachePath, 'utf8')
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return
    }
    throw error
  }

  const trimmedContents = contents.trim()

  // Expo treats this file as derived local state. If it gets truncated or left
  // half-written, `expo run:ios` bails before it even reaches the native build.
  // Deleting the bad cache is safe because Expo will regenerate it on demand.
  if (trimmedContents.length === 0) {
    await rm(expoPrebuildCachePath, { force: true })
    console.log(
      `Removed empty Expo prebuild cache at ${path.relative(projectRoot, expoPrebuildCachePath)} so Expo can regenerate it.`
    )
    return
  }

  try {
    JSON.parse(trimmedContents)
  } catch {
    await rm(expoPrebuildCachePath, { force: true })
    console.log(
      `Removed invalid Expo prebuild cache at ${path.relative(projectRoot, expoPrebuildCachePath)} so Expo can regenerate it.`
    )
  }
}

const run = (command, commandArgs) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${commandArgs.join(' ')} exited with code ${code ?? 1}`))
    })
  })

const runAndCapture = (command, commandArgs) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      env,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }
      reject(new Error(`${command} ${commandArgs.join(' ')} exited with code ${code ?? 1}\n${stderr}`))
    })
  })

const syncDevelopmentTeamOverride = async () => {
  if (target !== 'device') {
    return
  }

  const preferredTeamId =
    env.IOS_DEVELOPMENT_TEAM?.trim() || env.APPLE_DEVELOPMENT_TEAM?.trim()

  if (!preferredTeamId) {
    return
  }

  const projectFilePath = resolveNativeProjectFilePath()

  let projectFile
  try {
    projectFile = await readFile(projectFilePath, 'utf8')
  } catch {
    return
  }

  const configuredTeamIds = Array.from(
    new Set(
      Array.from(
        projectFile.matchAll(/(?:DevelopmentTeam|DEVELOPMENT_TEAM) = "([A-Z0-9]+)";/g)
      ).map((match) => match[1])
    )
  )

  if (configuredTeamIds.length === 1 && configuredTeamIds[0] === preferredTeamId) {
    return
  }

  const nextProjectFile = projectFile
    .replace(/DevelopmentTeam = "[A-Z0-9]+";/g, `DevelopmentTeam = "${preferredTeamId}";`)
    .replace(/DEVELOPMENT_TEAM = "[A-Z0-9]+";/g, `DEVELOPMENT_TEAM = "${preferredTeamId}";`)

  if (nextProjectFile === projectFile) {
    return
  }

  await writeFile(projectFilePath, nextProjectFile)

  const previousTeamLabel =
    configuredTeamIds.length > 0 ? configuredTeamIds.join(', ') : 'no configured team'

  console.log(
    `Applied local iPhone signing team override from ${previousTeamLabel} to ${preferredTeamId} in ${path.relative(projectRoot, projectFilePath)}.`
  )
}

const resolveRequestedDeviceName = async () => {
  const requestedDeviceName = process.env.IOS_DEVICE_NAME?.trim()

  if (requestedDeviceName) {
    return requestedDeviceName
  }

  let stdout
  try {
    ;({ stdout } = await runAndCapture('xcrun', ['xctrace', 'list', 'devices']))
  } catch {
    return undefined
  }

  const physicalDeviceSection = stdout.split('== Simulators ==')[0] ?? ''
  const iphoneNames = physicalDeviceSection
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('iPhone') && !line.includes('Simulator'))
    .map((line) => line.match(/^(.*) \([^)]+\) \([0-9A-F-]+\)$/)?.[1] ?? '')
    .filter(Boolean)

  if (iphoneNames.length === 1) {
    return iphoneNames[0]
  }

  if (iphoneNames.length > 1) {
    console.error('Multiple physical iPhones were detected. Set IOS_DEVICE_NAME to the device name you want to use.')
    iphoneNames.forEach((name) => console.error(`  - ${name}`))
    throw new Error('Could not automatically choose a physical iPhone.')
  }

  return undefined
}

const printDeviceProvisioningGuidance = async () => {
  let logContents

  try {
    logContents = await readFile(xcodeBuildLogPath, 'utf8')
  } catch {
    return false
  }

  const missingAccount = logContents.includes('No Account for Team')
  const missingProfiles = logContents.includes("No profiles for '")

  if (!missingAccount && !missingProfiles) {
    return false
  }

  const workspacePath = path.join(
    iosDir,
    `${sanitizeNativeProjectName(resolveNativeProjectDisplayName(resolveBaseAppName()))}.xcworkspace`
  )

  console.error('')
  console.error('Device build failed because Xcode could not sign this app for your iPhone.')

  if (missingAccount) {
    console.error('Xcode could not find a signed-in Apple account for the selected Team.')
  }
  if (missingProfiles) {
    console.error('Xcode could not create or find an iOS development provisioning profile for this bundle identifier.')
  }

  console.error('')
  console.error('Fix it in Xcode:')
  console.error(`  1. Open ${workspacePath}`)
  console.error('  2. Xcode > Settings > Accounts and sign in with your Apple ID if needed.')
  console.error('  3. Select the MyGuest app target > Signing & Capabilities.')
  console.error('  4. Turn on "Automatically manage signing" and choose your Team.')
  console.error('  5. Build once in Xcode so it can register the phone and create the profile.')
  console.error('  6. Re-run `npm run ios:device`.')
  console.error('')
  console.error(`Full Xcode log: ${xcodeBuildLogPath}`)

  return true
}

console.log(
  clean
    ? target === 'simulator'
      ? 'Running a clean MyGuest iOS Simulator build.'
      : 'Running a clean MyGuest build for the connected iPhone.'
    : target === 'simulator'
      ? 'Launching MyGuest in the iOS Simulator.'
      : 'Launching MyGuest on the connected iPhone.'
)
if (target === 'simulator') {
  console.log('Use `npm run dev:sim` for the fastest localhost Metro loop on this Mac.')
} else {
  console.log('Use `npm run dev` for LAN or `npm run dev:tunnel` when the phone is off-network.')
  console.log('Unlock your iPhone before the final app launch handoff. A locked phone can make Expo look stuck at "Connecting to..." after a successful build.')
  if (lanManualUrls) {
    console.log('If `MyGuest Dev` says no development servers were found while using `npm run dev`, these are the LAN fallback URLs:')
    console.log(`  Metro: ${lanManualUrls.metroBase}`)
    console.log(`  Dev client: ${lanManualUrls.devClientUrl}`)
  }
  console.log('If you are using `npm run dev:tunnel`, use the tunnel URL from that terminal instead of the LAN fallback above.')
}
if (!appleSignInEnabled) {
  console.log(
    'Sign in with Apple is disabled for this local dev build so Personal Team provisioning can succeed. Set EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN=true to opt in.'
  )
}

if (clean) {
  await run('npx', ['expo', 'prebuild', '--clean'])
}

await repairExpoPrebuildCacheFile()
await stripAppleSignInEntitlement()
await pruneStaleWorkspaces()
await syncDevelopmentTeamOverride()
const expoRunArgs = ['expo', 'run:ios']

if (target === 'device') {
  const deviceName = await resolveRequestedDeviceName()

  if (deviceName) {
    expoRunArgs.push('--device', deviceName)
  } else {
    expoRunArgs.push('--device')
  }
}

expoRunArgs.push('--no-bundler')

try {
  await run('npx', expoRunArgs)
} catch (error) {
  if (target === 'device') {
    await printDeviceProvisioningGuidance()
  }
  throw error
}
