#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const patches = [
  {
    name: 'expo-crypto',
    target: path.join(
      process.cwd(),
      'node_modules',
      'expo-crypto',
      'ios',
      'AES',
      'AesCryptoModule.swift'
    ),
    apply: (source) =>
      source
        .replace(/StaticAsyncFunction\("generate"/g, 'AsyncFunction("generate"')
        .replace(/StaticAsyncFunction\("import"/g, 'AsyncFunction("import"')
        .replace(/StaticFunction\("fromCombined"/g, 'Function("fromCombined"')
        .replace(/StaticFunction\("fromParts"/g, 'Function("fromParts"')
  },
  {
    name: 'expo-file-system',
    target: path.join(
      process.cwd(),
      'node_modules',
      'expo-file-system',
      'ios',
      'FileSystemModule.swift'
    ),
    apply: (source) =>
      source.replace(
        /ExpoAppDelegate\.getSubscriberOfType/g,
        'ExpoAppDelegateSubscriberRepository.getSubscriberOfType'
      )
  },
  {
    name: 'expo-cli-ios-signing',
    target: path.join(
      process.cwd(),
      'node_modules',
      '@expo',
      'cli',
      'build',
      'src',
      'run',
      'ios',
      'codeSigning',
      'configureCodeSigning.js'
    ),
    apply: (source) =>
      source
        .replace(
          `async function ensureDeviceIsCodeSignedForDeploymentAsync(projectRoot) {
    if (isCodeSigningConfigured(projectRoot)) {
        return null;
    }
    return configureCodeSigningAsync(projectRoot);
}`,
          `async function ensureDeviceIsCodeSignedForDeploymentAsync(projectRoot) {
    const configuredSigning = isCodeSigningConfigured(projectRoot);
    if (configuredSigning && configuredSigning !== true) {
        return configuredSigning;
    }
    if (configuredSigning) {
        return null;
    }
    return configureCodeSigningAsync(projectRoot);
}`
        )
        .replace(
          `        return true;
    }
    const allTargetsHaveProfiles`,
          `        return teamList[0] || true;
    }
    const allTargetsHaveProfiles`
        )
  },
  {
    name: 'expo-cli-ngrok-timeout',
    target: path.join(
      process.cwd(),
      'node_modules',
      '@expo',
      'cli',
      'build',
      'src',
      'start',
      'server',
      'AsyncNgrok.js'
    ),
    apply: (source) =>
      source.replace(
        `const TUNNEL_TIMEOUT = 10 * 1000;`,
        `const TUNNEL_TIMEOUT = Number(process.env.EXPO_TUNNEL_TIMEOUT_MS || 45000);`
      )
  },
  {
    name: 'expo-ngrok-client',
    target: path.join(
      process.cwd(),
      'node_modules',
      '@expo',
      'ngrok',
      'src',
      'client.js'
    ),
    apply: (source) =>
      source
        .replace(
          `    } catch (error) {
      let clientError;
      try {
        const response = JSON.parse(error.response.body);
        clientError = new NgrokClientError(
          response.msg,
          error.response,
          response
        );
      } catch (e) {
        clientError = new NgrokClientError(
          error.response.body,
          error.response,
          error.response.body
        );
      }
      throw clientError;
    }`,
          `    } catch (error) {
      const responseBody = error?.response?.body;
      const fallbackMessage = error?.message || "Ngrok request failed";
      let clientError;
      try {
        const response = responseBody ? JSON.parse(responseBody) : { msg: fallbackMessage };
        clientError = new NgrokClientError(
          response.msg || fallbackMessage,
          error?.response,
          response
        );
      } catch (e) {
        clientError = new NgrokClientError(
          typeof responseBody === "string" ? responseBody : fallbackMessage,
          error?.response,
          responseBody ?? { msg: fallbackMessage }
        );
      }
      clientError.code = error?.code;
      throw clientError;
    }`
        )
        .replace(
          `    } catch (error) {
      const response = JSON.parse(error.response.body);
      throw new NgrokClientError(response.msg, error.response, response);
    }`,
          `    } catch (error) {
      const responseBody = error?.response?.body;
      const fallbackMessage = error?.message || "Ngrok request failed";
      let response;
      try {
        response = responseBody ? JSON.parse(responseBody) : { msg: fallbackMessage };
      } catch (e) {
        response = responseBody ?? { msg: fallbackMessage };
      }
      const clientError = new NgrokClientError(response.msg || fallbackMessage, error?.response, response);
      clientError.code = error?.code;
      throw clientError;
    }`
        )
  },
  {
    name: 'expo-ngrok-retry',
    target: path.join(
      process.cwd(),
      'node_modules',
      '@expo',
      'ngrok',
      'index.js'
    ),
    apply: (source) =>
      source.replace(
        `  } catch (err) {
    if (!isRetriable(err) || retryCount >= 100) {
      throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return connectRetry(opts, ++retryCount);
  }`,
        `  } catch (err) {
    const isLocalApiRace =
      err?.code === "ECONNREFUSED" ||
      /ECONNREFUSED 127\\.0\\.0\\.1:4040/.test(err?.message || "") ||
      /ECONNREFUSED 127\\.0\\.0\\.1:4040/.test(err?.body?.msg || "");
    if ((!isRetriable(err) && !isLocalApiRace) || retryCount >= 100) {
      throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return connectRetry(opts, ++retryCount);
  }`
      )
  },
  {
    name: 'expo-ngrok-client-code',
    target: path.join(
      process.cwd(),
      'node_modules',
      '@expo',
      'ngrok',
      'src',
      'client.js'
    ),
    apply: (source) =>
      source
        .replace(
          `      throw clientError;`,
          `      clientError.code = error?.code;
      throw clientError;`
        )
        .replace(
          `      throw new NgrokClientError(response.msg || fallbackMessage, error?.response, response);`,
          `      const clientError = new NgrokClientError(response.msg || fallbackMessage, error?.response, response);
      clientError.code = error?.code;
      throw clientError;`
        )
  },
  {
    name: 'expo-ngrok-utils',
    target: path.join(
      process.cwd(),
      'node_modules',
      '@expo',
      'ngrok',
      'src',
      'utils.js'
    ),
    apply: (source) =>
      source.replace(
        `  const body = err.body;`,
        `  const body = err?.body || {};`
      )
  },
  {
    // Some local installs expose resolve's homedir helper through a default
    // export shape during Xcode script execution. Normalize it so Expo's
    // Metro/export helpers can resolve modules consistently in build phases.
    name: 'resolve-async-homedir-interop',
    target: path.join(
      process.cwd(),
      'node_modules',
      'resolve',
      'lib',
      'async.js'
    ),
    apply: (source) =>
      source.replace(
        `var getHomedir = require('./homedir');
var path = require('path');`,
        `var getHomedir = require('./homedir');
if (getHomedir && typeof getHomedir !== 'function' && typeof getHomedir.default === 'function') {
    getHomedir = getHomedir.default;
}
var path = require('path');`
      )
  },
  {
    name: 'resolve-sync-homedir-interop',
    target: path.join(
      process.cwd(),
      'node_modules',
      'resolve',
      'lib',
      'sync.js'
    ),
    apply: (source) =>
      source.replace(
        `var path = require('path');
var getHomedir = require('./homedir');
var caller = require('./caller');`,
        `var path = require('path');
var getHomedir = require('./homedir');
if (getHomedir && typeof getHomedir !== 'function' && typeof getHomedir.default === 'function') {
    getHomedir = getHomedir.default;
}
var caller = require('./caller');`
      )
  },
  {
    // Metro can expose @tamagui/static through a slightly different CommonJS
    // interop shape than plain Node. Normalize the loader so the Tamagui Babel
    // plugin can resolve its static helpers in both environments.
    name: 'tamagui-static-sync-export-interop',
    target: path.join(
      process.cwd(),
      'node_modules',
      '@tamagui',
      'static-sync',
      'dist',
      'index.cjs'
    ),
    apply: (source) =>
      source
        .replace(
          `module.exports = __toCommonJS(index_exports);
var import_synckit = require("synckit"), import_node_url = require("node:url"), import_meta = {},`,
          `module.exports = __toCommonJS(index_exports);
var resolveStaticModule = () => {
  const mod = require("@tamagui/static");
  const candidates = [mod?.default, mod, mod?.default?.default].filter(Boolean);
  for (const candidate of candidates) {
    if (
      typeof candidate.getBabelPlugin === "function" ||
      typeof candidate.getPragmaOptions === "function"
    ) {
      return candidate;
    }
  }
  return mod?.default ?? mod;
};
var import_synckit = require("synckit"), import_node_url = require("node:url"), import_meta = {},`
        )
        .replace(
          `  let { default: Static } = require("@tamagui/static");
  return Static.getPragmaOptions(props);`,
          `  let Static = resolveStaticModule();
  return Static.getPragmaOptions(props);`
        )
        .replace(
          `  let { default: Static } = require("@tamagui/static");
  return Static.getBabelPlugin();`,
          `  let Static = resolveStaticModule();
  return Static.getBabelPlugin();`
        )
  },
  {
    // RN 0.81 can expose two copies of RCTBridge.h via the prebuilt xcframework
    // and the public React headers. These view manager files use a bare import,
    // which can pull the xcframework copy and trigger duplicate interface errors.
    name: 'react-native-ios-utilities-rctbridge-wrapper-view',
    target: path.join(
      process.cwd(),
      'node_modules',
      'react-native-ios-utilities',
      'ios',
      'Sources',
      'RNIWrapperView',
      'RNIWrapperViewManager.mm'
    ),
    apply: (source) =>
      source.replace(`#import "RCTBridge.h"`, `#import <React/RCTBridge.h>`)
  },
  {
    name: 'react-native-ios-utilities-rctbridge-detached-view',
    target: path.join(
      process.cwd(),
      'node_modules',
      'react-native-ios-utilities',
      'ios',
      'Sources',
      'RNIDetachedView',
      'RNIDetachedViewManager.mm'
    ),
    apply: (source) =>
      source.replace(`#import "RCTBridge.h"`, `#import <React/RCTBridge.h>`)
  },
  {
    name: 'react-native-ios-utilities-rctbridge-dummy-view',
    target: path.join(
      process.cwd(),
      'node_modules',
      'react-native-ios-utilities',
      'ios',
      'Sources',
      'RNIDummyTestView',
      'RNIDummyTestViewManager.mm'
    ),
    apply: (source) =>
      source.replace(`#import "RCTBridge.h"`, `#import <React/RCTBridge.h>`)
  },
  {
    // react-native-ios-context-menu hits the same duplicate RCTBridge header
    // resolution issue as react-native-ios-utilities under RN 0.81's prebuilt
    // React headers. Force the canonical public React include path.
    name: 'react-native-ios-context-menu-rctbridge-button-manager',
    target: path.join(
      process.cwd(),
      'node_modules',
      'react-native-ios-context-menu',
      'ios',
      'RNIContextMenuButton',
      'RNIContextMenuButtonViewManager.mm'
    ),
    apply: (source) =>
      source.replace(`#import "RCTBridge.h"`, `#import <React/RCTBridge.h>`)
  },
  {
    name: 'react-native-ios-context-menu-rctbridge-view-manager',
    target: path.join(
      process.cwd(),
      'node_modules',
      'react-native-ios-context-menu',
      'ios',
      'RNIContextMenuView',
      'RNIContextMenuViewManager.mm'
    ),
    apply: (source) =>
      source.replace(`#import "RCTBridge.h"`, `#import <React/RCTBridge.h>`)
  },
  {
    // CocoaPods can surface RNSScreen.h through the public headers view while
    // compiling another file, which makes this sibling-header import fragile.
    // Point it at the public pod header explicitly so the include always resolves.
    name: 'react-native-screens-content-wrapper-header',
    target: path.join(
      process.cwd(),
      'node_modules',
      'react-native-screens',
      'ios',
      'RNSScreen.h'
    ),
    apply: (source) =>
      source.replace(
        `#import "RNSScreenContentWrapper.h"`,
        `#import <RNScreens/RNSScreenContentWrapper.h>`
      )
  },
  {
    name: 'react-native-screens-content-wrapper-impl',
    target: path.join(
      process.cwd(),
      'node_modules',
      'react-native-screens',
      'ios',
      'RNSScreen.mm'
    ),
    apply: (source) =>
      source.replace(
        `#import "RNSScreenContentWrapper.h"`,
        `#import <RNScreens/RNSScreenContentWrapper.h>`
      )
  }
];

let didAny = false;

for (const patch of patches) {
  if (!fs.existsSync(patch.target)) {
    console.log(`[postinstall] ${patch.name} patch skipped (file not found).`);
    continue;
  }

  const source = fs.readFileSync(patch.target, 'utf8');
  const patched = patch.apply(source);

  if (patched === source) {
    console.log(`[postinstall] ${patch.name} patch already applied.`);
    continue;
  }

  fs.writeFileSync(patch.target, patched);
  console.log(`[postinstall] Applied ${patch.name} compatibility patch.`);
  didAny = true;
}

if (!didAny) {
  process.exit(0);
}
