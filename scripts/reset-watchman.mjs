import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')

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

try {
  console.log(`Resetting Watchman state for ${projectRoot}`)
  await run('watchman', ['watch-del', projectRoot])
  await run('watchman', ['watch-project', projectRoot])
  console.log('Watchman state refreshed.')
} catch (error) {
  console.error('Watchman reset failed.')
  console.error(
    'If Watchman is not installed, install it first or run the two commands manually once it is available.'
  )
  throw error
}
