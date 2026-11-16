const fs = require('node:fs')
const colors = require('tailwindcss/colors')

const source = fs.readFileSync('src/constants/color.ts', 'utf8')

function readConstant(name) {
  const match = source.match(new RegExp(name + ':\\s*[\'"](#(?:[0-9a-fA-F]{6}))["\']'))
  if (!match) throw new Error('Não foi possível localizar COLORS.' + name + ' em src/constants/color.ts')
  return match[1]
}

function luminance(hex) {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
  const linear = channels.map((value) => value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

const palette = {
  white: readConstant('white'),
  black: readConstant('black'),
  background: readConstant('background'),
  inactive: readConstant('inactive'),
  active: readConstant('active'),
  slate300: colors.slate[300],
  slate400: colors.slate[400],
  slate500: colors.slate[500],
  slate600: colors.slate[600],
  slate700: colors.slate[700],
  slate800: colors.slate[800],
  red600: colors.red[600],
  red400: colors.red[400],
  zinc400: colors.zinc[400],
}

const checks = [
  ['Texto principal na tela', palette.white, palette.background],
  ['Texto secundário na tela', palette.inactive, palette.background],
  ['Texto em lista selecionada', palette.white, palette.slate600],
  ['Placeholder em campo', palette.slate300, palette.slate700],
  ['Texto secundário em cartão', palette.slate300, palette.slate800],
  ['Texto muted em cartão', palette.slate400, palette.slate800],
  ['Ação lime no fundo', palette.active, palette.background],
  ['Texto preto em botão lime', palette.black, palette.active],
  ['Texto branco em botão de cancelar', palette.white, palette.red600],
  ['Texto preto em botão neutro', palette.black, palette.zinc400],
  ['Texto branco em botão secundário', palette.white, palette.slate500],
  ['Texto de erro em cartão', palette.red400, palette.slate800],
  ['Texto secundário em lista selecionada', palette.slate300, palette.slate600],
]

let failed = false
for (const [label, foreground, background] of checks) {
  const ratio = contrast(foreground, background)
  const passed = ratio >= 4.5
  console.log((passed ? 'PASS' : 'FAIL') + ' ' + label + ': ' + ratio.toFixed(2) + ':1')
  if (!passed) failed = true
}

if (failed) {
  console.error('Há combinações abaixo do contraste mínimo WCAG AA de 4,5:1 para texto normal.')
  process.exitCode = 1
} else {
  console.log('Todas as combinações verificadas atendem ao mínimo WCAG AA de 4,5:1.')
}
