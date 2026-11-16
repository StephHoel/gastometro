const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const json = (file) => JSON.parse(read(file))
const errors = []

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(label + ': esperado "' + expected + '", encontrado "' + actual + '".')
  }
}

function assertIncludes(file, content, expected) {
  if (!content.includes(expected)) {
    errors.push(file + ': não contém "' + expected + '". Atualize a documentação ou a fonte de configuração correspondente.')
  }
}

function countMiniSpecs(status) {
  const directory = path.join(root, 'docs', 'specs', status)
  if (!fs.existsSync(directory)) return 0
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^\d{2}-.*\.md$/i.test(entry.name))
    .length
}

const pkg = json('package.json')
const lock = json('package-lock.json')
const readme = read('README.md')
const spec = read('docs/SPEC.md')
const testSpec = read('docs/specs/active/05-testes-automatizados.md')
const specIndex = read('docs/specs/README.md')
const changelog = read('docs/CHANGELOG.md')
const appConfig = read('app.config.js')
const nodeVersion = read('.nvmrc').trim()

const version = pkg.version
const expoRange = pkg.dependencies.expo
const expoVersion = expoRange.replace(/^[~^]/, '')
const expoMajor = expoVersion.split('.')[0]
const reactNative = pkg.dependencies['react-native']
const react = pkg.dependencies.react

assertEqual('package-lock.json version', lock.version, version)
assertEqual('package-lock.json packages[""] version', lock.packages?.['']?.version, version)
assertEqual('package-lock.json Expo', lock.packages?.['node_modules/expo']?.version, expoVersion)
assertEqual('package-lock.json React Native', lock.packages?.['node_modules/react-native']?.version, reactNative)
assertEqual('package-lock.json React', lock.packages?.['node_modules/react']?.version, react)

const appVersion = appConfig.match(/version:\s*['"]([^'"]+)['"]/)
assertEqual('app.config.js version', appVersion?.[1] ?? '(não encontrada)', version)

const readmeBadge = readme.match(/badge\/Release-v([0-9]+\.[0-9]+\.[0-9]+)-blue/)
assertEqual('README release badge', readmeBadge?.[1] ?? '(não encontrado)', version)

const changelogVersion = changelog.match(/^##\s+([0-9]+\.[0-9]+\.[0-9]+)/m)
assertEqual('primeira versão do CHANGELOG.md', changelogVersion?.[1] ?? '(não encontrada)', version)

assertIncludes('README.md', readme, 'Expo SDK ' + expoMajor)
assertIncludes('README.md', readme, 'React Native ' + reactNative)
assertIncludes('README.md', readme, 'React ' + react)
assertIncludes('README.md', readme, 'Node ' + nodeVersion)

assertIncludes('docs/SPEC.md', spec, 'Expo SDK ' + expoMajor)
assertIncludes('docs/SPEC.md', spec, 'React Native `' + reactNative + '`')
assertIncludes('docs/SPEC.md', spec, 'React `' + react + '`')
assertIncludes('docs/SPEC.md', spec, 'Node ' + nodeVersion)
assertIncludes('docs/SPEC.md', spec, '**Versão do App:** ' + version)

assertIncludes('docs/specs/active/05-testes-automatizados.md', testSpec, 'Expo SDK ' + expoMajor)

if (/badge\/Tests-\d+%20passing|badge\/Coverage-[\d.]+%25/i.test(readme)) {
  errors.push('README.md: remova badges com contagem de testes ou percentual de cobertura mantidos manualmente.')
}
if (/Cobertura de Testes:\s*[\d.]+%/i.test(spec)) {
  errors.push('docs/SPEC.md: não mantenha percentual de cobertura volátil no cabeçalho; consulte os relatórios gerados.')
}
if (/docs\/specs\/planned\/(?:20|21)-/i.test(readme)) {
  errors.push('README.md: specs 20 e 21 estão ativas e não devem aparecer como planejadas.')
}

const statusCounts = {
  done: countMiniSpecs('done'),
  active: countMiniSpecs('active'),
  planned: countMiniSpecs('planned'),
}
for (const [status, count] of Object.entries(statusCounts)) {
  const label = status === 'done' ? 'Implementadas' : status === 'active' ? 'Ativas' : 'Planejadas'
  const row = specIndex.match(new RegExp('\\*\\*' + label + '\\*\\*\\s*\\|\\s*(\\d+)'))
  assertEqual('docs/specs/README.md quantidade ' + label, row?.[1] ?? '(linha não encontrada)', String(count))
}
assertEqual('docs/specs/README.md total', (specIndex.match(/\*\*Total\*\*\s*\|\s*(\d+)/) ?? [])[1] ?? '(linha não encontrada)', String(statusCounts.done + statusCounts.active + statusCounts.planned))

if (errors.length > 0) {
  console.error('Falha na verificação de consistência documental:')
  for (const error of errors) console.error('- ' + error)
  process.exitCode = 1
} else {
  console.log('Consistência documental validada:')
  console.log('- versão ' + version + ' alinhada entre package.json, package-lock.json, app.config.js, README e CHANGELOG')
  console.log('- stack alinhada: Expo SDK ' + expoMajor + ', React Native ' + reactNative + ', React ' + react + ', Node ' + nodeVersion)
  console.log('- mini-specs: ' + statusCounts.done + ' implementadas, ' + statusCounts.active + ' ativas e ' + statusCounts.planned + ' planejadas')
  console.log('- indicadores voláteis de testes e cobertura não são duplicados em badges estáticos')
}
