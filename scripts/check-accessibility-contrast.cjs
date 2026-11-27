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
  { category: 'Texto normal', label: 'Texto principal na tela', foreground: palette.white, background: palette.background, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto secundário na tela', foreground: palette.inactive, background: palette.background, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto em lista selecionada', foreground: palette.white, background: palette.slate600, minimum: 4.5 },
  { category: 'Texto normal', label: 'Placeholder em campo', foreground: palette.slate300, background: palette.slate700, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto secundário em cartão', foreground: palette.slate300, background: palette.slate800, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto muted em cartão', foreground: palette.slate400, background: palette.slate800, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto preto em botão lime', foreground: palette.black, background: palette.active, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto branco em botão de cancelar', foreground: palette.white, background: palette.red600, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto preto em botão neutro', foreground: palette.black, background: palette.zinc400, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto branco em botão secundário', foreground: palette.white, background: palette.slate500, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto de erro em cartão', foreground: palette.red400, background: palette.slate800, minimum: 4.5 },
  { category: 'Texto normal', label: 'Texto secundário em lista selecionada', foreground: palette.slate300, background: palette.slate600, minimum: 4.5 },
  { category: 'Texto grande', label: 'Texto grande em botão secundário', foreground: palette.white, background: palette.slate500, minimum: 3 },
  { category: 'Texto grande', label: 'Texto grande em cartão', foreground: palette.slate300, background: palette.slate800, minimum: 3 },
  { category: 'Componente gráfico e foco', label: 'Contorno de foco no fundo principal', foreground: palette.active, background: palette.background, minimum: 3 },
  { category: 'Componente gráfico e foco', label: 'Contorno de foco em cartão', foreground: palette.active, background: palette.slate800, minimum: 3 },
  { category: 'Componente gráfico e foco', label: 'Ícone claro em cartão', foreground: palette.white, background: palette.slate800, minimum: 3 },
  { category: 'Componente gráfico e foco', label: 'Ícone de remoção em botão de alerta', foreground: palette.black, background: palette.red600, minimum: 3 },
  { category: 'Componente gráfico e foco', label: 'Ícone secundário em cartão', foreground: palette.slate400, background: palette.slate800, minimum: 3 },
  { category: 'Componente gráfico e foco', label: 'Indicador de seleção em cartão', foreground: palette.active, background: palette.slate800, minimum: 3 },
  { category: 'Componente gráfico e foco', label: 'Ícone em lista selecionada', foreground: palette.slate300, background: palette.slate600, minimum: 3 },
]

let failed = false

for (const check of checks) {
  const ratio = contrast(check.foreground, check.background)
  const passed = ratio >= check.minimum
  const requirement = check.minimum.toFixed(1).replace('.', ',')
  console.log(
    (passed ? 'PASS' : 'FAIL') +
    ' [' + check.category + '] ' +
    check.label +
    ': ' + ratio.toFixed(2) + ':1 (mínimo ' + requirement + ':1)',
  )
  if (!passed) failed = true
}

if (failed) {
  console.error('Há combinações abaixo dos critérios WCAG AA configurados.')
  process.exitCode = 1
} else {
  console.log('Todas as combinações documentadas atendem aos critérios WCAG AA configurados.')
}
