#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const target = path.join(
  process.cwd(),
  'node_modules',
  'expo-crypto',
  'ios',
  'AES',
  'AesCryptoModule.swift'
);

if (!fs.existsSync(target)) {
  console.log('[postinstall] expo-crypto iOS patch skipped (file not found).');
  process.exit(0);
}

const source = fs.readFileSync(target, 'utf8');

const patched = source
  .replace(/StaticAsyncFunction\("generate"/g, 'AsyncFunction("generate"')
  .replace(/StaticAsyncFunction\("import"/g, 'AsyncFunction("import"')
  .replace(/StaticFunction\("fromCombined"/g, 'Function("fromCombined"')
  .replace(/StaticFunction\("fromParts"/g, 'Function("fromParts"');

if (patched === source) {
  console.log('[postinstall] expo-crypto iOS patch already applied.');
  process.exit(0);
}

fs.writeFileSync(target, patched);
console.log('[postinstall] Applied expo-crypto iOS compatibility patch.');
