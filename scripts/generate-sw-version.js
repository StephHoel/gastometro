#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const packageJsonPath = path.join(__dirname, '../package.json')
const outputPath = path.join(__dirname, '../public/sw-version.js')

try {
  const packageJsonRaw = fs.readFileSync(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageJsonRaw)
  const version = typeof packageJson.version === 'string' ? packageJson.version.trim() : ''

  if (!version) {
    throw new Error('Campo version ausente ou invalido em package.json')
  }

  const output = `self.__APP_VERSION__ = '${version}'\n`
  fs.writeFileSync(outputPath, output, 'utf-8')

  console.log(`✓ Arquivo de versao do Service Worker atualizado: ${version}`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error('✗ Erro ao gerar public/sw-version.js:', message)
  process.exit(1)
}
