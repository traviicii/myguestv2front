const baseConfig = require('./app.config.base.js')
const DEFAULT_EAS_PROJECT_ID = '075d53ad-3557-4660-907f-b1bbc5274372'

const baseScheme = baseConfig.scheme ?? 'myguest'
const baseIosBundleIdentifier = baseConfig.ios?.bundleIdentifier ?? 'com.travispeck.myguest'
const baseAndroidPackage = baseConfig.android?.package ?? 'com.travispeck.myguest'

const variantSettings = {
  development: {
    displayName: 'MyGuest Dev',
    scheme: `${baseScheme}-dev`,
    iosBundleIdentifier: `${baseIosBundleIdentifier}.dev`,
    androidPackage: `${baseAndroidPackage}.dev`,
  },
  preview: {
    displayName: 'MyGuest Preview',
    scheme: baseScheme,
    iosBundleIdentifier: baseIosBundleIdentifier,
    androidPackage: baseAndroidPackage,
  },
  production: {
    displayName: baseConfig.name ?? 'MyGuest',
    scheme: baseScheme,
    iosBundleIdentifier: baseIosBundleIdentifier,
    androidPackage: baseAndroidPackage,
  },
}

function resolveAppleSignInEnabled() {
  return process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN !== 'false'
}

function resolveAppVariant() {
  const requestedVariant = (process.env.APP_VARIANT ?? 'production').trim().toLowerCase()
  return variantSettings[requestedVariant] ? requestedVariant : 'production'
}

function resolveEasProjectId() {
  const projectId = process.env.EXPO_EAS_PROJECT_ID?.trim()
  return projectId || DEFAULT_EAS_PROJECT_ID
}

function normalizePluginEntry(plugin) {
  return Array.isArray(plugin) ? plugin[0] : plugin
}

module.exports = () => {
  const appleSignInEnabled = resolveAppleSignInEnabled()
  const appVariant = resolveAppVariant()
  const variant = variantSettings[appVariant]
  const easProjectId = resolveEasProjectId()
  const plugins = (baseConfig.plugins ?? []).filter((plugin) => {
    if (appleSignInEnabled) {
      return true
    }
    return normalizePluginEntry(plugin) !== 'expo-apple-authentication'
  })
  const extra = {
    ...(baseConfig.extra ?? {}),
    appVariant,
  }

  if (easProjectId) {
    extra.eas = {
      ...(baseConfig.extra?.eas ?? {}),
      projectId: easProjectId,
    }
  }

  const updates = {
    ...(baseConfig.updates ?? {}),
  }

  if (easProjectId) {
    updates.url = `https://u.expo.dev/${easProjectId}`
  }

  return {
    ...baseConfig,
    name: variant.displayName,
    scheme: variant.scheme,
    runtimeVersion: baseConfig.runtimeVersion ?? { policy: 'appVersion' },
    extra,
    ...(Object.keys(updates).length ? { updates } : {}),
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: variant.iosBundleIdentifier,
      usesAppleSignIn: appleSignInEnabled,
    },
    android: {
      ...baseConfig.android,
      package: variant.androidPackage,
    },
    plugins,
  }
}
