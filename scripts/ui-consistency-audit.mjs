#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const targetDirs = ['app', 'components']
const allowedExtensions = new Set(['.ts', '.tsx'])

const forbiddenControlPrimitives = new Set([
  'Button',
  'Input',
  'Switch',
  'TextArea',
])

const controlPrimitiveAllowList = new Set([
  normalizePath(path.join(rootDir, 'components/ui/controls.tsx')),
  normalizePath(path.join(rootDir, 'components/CurrentToast.tsx')),
])

const hardColorAllowList = new Set(
  [
    'app/+html.tsx',
    'components/AmbientBackdrop.tsx',
    'components/ui/glassStyle.ts',
    'components/ui/controls.tsx',
    'components/utils/color.ts',
    'tamagui.config.ts',
  ].map((entry) => normalizePath(path.join(rootDir, entry)))
)

const hardColorPattern =
  /(["'`])(#(?:[0-9a-fA-F]{3,8})|rgba?\([^"'`]+\)|hsla?\([^"'`]+\))\1/g

const findings = []

for (const dir of targetDirs) {
  const absoluteDir = path.join(rootDir, dir)
  if (!fs.existsSync(absoluteDir)) continue
  scanDirectory(absoluteDir)
}

if (findings.length === 0) {
  console.log('UI consistency audit passed with no findings.')
  process.exit(0)
}

console.error(`UI consistency audit found ${findings.length} finding(s):`)
for (const finding of findings) {
  const relativePath = path.relative(rootDir, finding.file)
  console.error(
    `- ${relativePath}:${finding.line} [${finding.rule}] ${finding.message}`
  )
}
process.exit(1)

function scanDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.expo') continue
      scanDirectory(absolutePath)
      continue
    }

    if (!allowedExtensions.has(path.extname(entry.name))) continue
    scanFile(absolutePath)
  }
}

function scanFile(filePath) {
  const normalizedFilePath = normalizePath(filePath)
  const source = fs.readFileSync(filePath, 'utf8')

  scanForbiddenControlPrimitives(normalizedFilePath, source)
  scanHardCodedColors(normalizedFilePath, source)
}

function scanForbiddenControlPrimitives(filePath, source) {
  if (controlPrimitiveAllowList.has(filePath)) return

  const importPattern = /import\s*{([^}]+)}\s*from\s*['"]tamagui['"]/g
  for (const match of source.matchAll(importPattern)) {
    const imports = match[1]
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => value.split(/\s+as\s+/i)[0]?.trim() ?? value.trim())

    const invalidImports = imports.filter((value) =>
      forbiddenControlPrimitives.has(value)
    )
    if (invalidImports.length === 0) continue

    const line = getLineNumber(source, match.index ?? 0)
    findings.push({
      file: filePath,
      line,
      rule: 'forbidden-primitive',
      message: `Import shared wrappers from components/ui/controls.tsx instead of raw Tamagui primitives: ${invalidImports.join(', ')}.`,
    })
  }
}

function scanHardCodedColors(filePath, source) {
  if (hardColorAllowList.has(filePath)) return

  for (const match of source.matchAll(hardColorPattern)) {
    const colorValue = match[2]
    const line = getLineNumber(source, match.index ?? 0)
    findings.push({
      file: filePath,
      line,
      rule: 'hardcoded-color',
      message: `Use semantic theme tokens instead of hard-coded color ${colorValue}.`,
    })
  }
}

function getLineNumber(source, index) {
  return source.slice(0, index).split('\n').length
}

function normalizePath(value) {
  return value.split(path.sep).join('/')
}
