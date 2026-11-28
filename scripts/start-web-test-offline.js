#!/usr/bin/env node

const { spawn } = require('child_process')

const command = 'npx expo start --web --dev-client --clear'

const child = spawn(command, {
  shell: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_PUBLIC_SW_DEV_ENABLED: '1',
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error('Falha ao iniciar modo web offline de teste:', error)
  process.exit(1)
})
