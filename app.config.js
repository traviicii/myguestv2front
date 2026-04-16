const baseConfig = require('./app.config.base.js')
const DEFAULT_EAS_PROJECT_ID = '075d53ad-3557-4660-907f-b1bbc5274372'
const variantDisplayNames = {
  development: 'MyGuest Dev',
  preview: 'MyGuest Preview',
  production: baseConfig.name ?? 'MyGuest',
}

function resolveAppleSignInEnabled() {
  return process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN !== 'false'
}

function resolveAppVariant() {
  const requestedVariant = (process.env.APP_VARIANT ?? 'production').trim().toLowerCase()
  return variantDisplayNames[requestedVariant] ? requestedVariant : 'production'
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
    name: variantDisplayNames[appVariant],
    runtimeVersion: baseConfig.runtimeVersion ?? { policy: 'appVersion' },
    extra,
    ...(Object.keys(updates).length ? { updates } : {}),
    ios: {
      ...baseConfig.ios,
      usesAppleSignIn: appleSignInEnabled,
    },
    plugins,
  }
}
