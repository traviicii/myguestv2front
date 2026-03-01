// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)
const zustandRoot = path.dirname(require.resolve('zustand/package.json'))

const ZUSTAND_WEB_CJS_MAP = {
  zustand: path.join(zustandRoot, 'index.js'),
  'zustand/middleware': path.join(zustandRoot, 'middleware.js'),
  'zustand/shallow': path.join(zustandRoot, 'shallow.js'),
  'zustand/traditional': path.join(zustandRoot, 'traditional.js'),
  'zustand/vanilla': path.join(zustandRoot, 'vanilla.js'),
}
const upstreamResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Expo web static export currently serves script bundles without `type="module"`.
  // Keep Zustand on CJS entrypoints for web to avoid `import.meta` parse failures.
  if (platform === 'web' && ZUSTAND_WEB_CJS_MAP[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: ZUSTAND_WEB_CJS_MAP[moduleName],
    }
  }

  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
