import { spawn } from 'node:child_process'

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

await run('npx', ['expo', 'run:ios', '--device'])
