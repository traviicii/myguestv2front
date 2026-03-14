import { spawn } from 'node:child_process'
import { readFile, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const iosDir = path.join(projectRoot, 'ios')

const args = new Set(process.argv.slice(2))

if (args.has('--help')) {
  console.log(`Usage: node scripts/ios-rebuild.mjs [--clean]

Rebuilds the native iPhone development app.

Options:
  --clean  Regenerate the native projects before rebuilding
`)
  process.exit(0)
}

const clean = args.has('--clean')

const sanitizeNativeProjectName = (value) => value.replace(/[^A-Za-z0-9]/g, '')

const pruneStaleWorkspaces = async () => {
  const appConfigRaw = await readFile(path.join(projectRoot, 'app.json'), 'utf8')
  const appConfig = JSON.parse(appConfigRaw)
  const expectedWorkspaceName = `${sanitizeNativeProjectName(appConfig.expo?.name ?? 'App')}.xcworkspace`
  const entries = await readdir(iosDir, { withFileTypes: true })
  const workspaceNames = entries
    .filter((entry) => entry.isDirectory() && entry.name.endsWith('.xcworkspace'))
    .map((entry) => entry.name)

  if (!workspaceNames.includes(expectedWorkspaceName)) {
    return
  }

  for (const workspaceName of workspaceNames) {
    if (workspaceName === expectedWorkspaceName) {
      continue
    }
    await rm(path.join(iosDir, workspaceName), { recursive: true, force: true })
    console.log(`Removed stale workspace: ${workspaceName}`)
  }
}

const run = (command, commandArgs) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
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

console.log(
  clean
    ? 'Running a clean MyGuest Dev iPhone rebuild.'
    : 'Rebuilding the MyGuest Dev iPhone app.'
)
console.log('Use this when native packages change, signing breaks, or the dev build expires.')

if (clean) {
  await run('npx', ['expo', 'prebuild', '--clean'])
}

await pruneStaleWorkspaces()
await run('npx', ['expo', 'run:ios', '--device'])
