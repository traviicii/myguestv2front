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
      throw new NgrokClientError(response.msg || fallbackMessage, error?.response, response);
    }`
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
