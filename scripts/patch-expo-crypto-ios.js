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
