import { spawn } from 'node:child_process'

const args = new Set(process.argv.slice(2))

if (args.has('--help')) {
  console.log(`Usage: node scripts/dev.mjs [--lan] [--clear]

Starts the MyGuest iPhone development server in dev-client mode.

Options:
  --lan    Use LAN instead of the default tunnel host
  --clear  Clear the Metro cache before starting
`)
  process.exit(0)
}

const host = args.has('--lan') ? 'lan' : 'tunnel'
const clear = args.has('--clear')
const expoArgs = ['expo', 'start', '--dev-client', '--host', host, '--scheme', 'myguestdev']

if (clear) {
  expoArgs.push('-c')
}

console.log(
  host === 'tunnel'
    ? 'Starting MyGuest Dev with a tunnel for reliability on a physical iPhone.'
    : 'Starting MyGuest Dev over LAN for a faster same-Wi-Fi connection.'
)
console.log('Keep this terminal open, then open MyGuest Dev on your iPhone.')
if (host === 'tunnel') {
  console.log('Tunnel mode may not auto-list the server in the app. Use "Enter URL manually" with the Metro URL if needed.')
}
console.log('Only use `npm run ios:rebuild` when native dependencies or app config change.')

const child = spawn('npx', expoArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
