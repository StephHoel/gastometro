#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function updateFile(rootDir, target) {
  const fullPath = path.join(rootDir, target.file)
  let content = fs.readFileSync(fullPath, 'utf8')

  for (const replacement of target.replacements) {
    if (!replacement.pattern.test(content)) {
      throw new Error(`Padrão não encontrado em ${target.file}: ${replacement.pattern}`)
    }
    content = content.replace(replacement.pattern, replacement.replace)
  }

  fs.writeFileSync(fullPath, content, 'utf8')
}

function main() {
  const rootDir = process.argv[2]
  const lineCoverage = process.argv[3]

  if (!rootDir || !lineCoverage) {
    throw new Error('Uso: node scripts/update-coverage-docs.js <rootDir> <lineCoverage>')
  }

  const lineCoverageBadge = `${lineCoverage}%25`

  const targets = [
    {
      file: 'README.md',
      replacements: [
        {
          pattern: /(https:\/\/img\.shields\.io\/badge\/Coverage-)([0-9]+(?:\.[0-9]+)?%25)(-[^)]+)/,
          replace: (_, prefix, __, suffix) => `${prefix}${lineCoverageBadge}${suffix}`,
        },
      ],
    },
    {
      file: path.join('docs', 'README.md'),
      replacements: [
        {
          pattern: /\| \*\*Cobertura\*\*\s*\|\s*[0-9]+(?:\.[0-9]+)?%\s*\|/,
          replace: (line) => line.replace(/[0-9]+(?:\.[0-9]+)?%/, `${lineCoverage}%`),
        },
      ],
    },
    {
      file: path.join('docs', 'SPEC.md'),
      replacements: [
        {
          pattern: /(\*\*Cobertura de Testes:\*\*\s*)([0-9]+(?:\.[0-9]+)?%)/,
          replace: (_, prefix) => `${prefix}${lineCoverage}%`,
        },
      ],
    },
  ]

  for (const target of targets) {
    updateFile(rootDir, target)
  }
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error('Falha ao atualizar cobertura na documentação:', message)
  process.exit(1)
}
