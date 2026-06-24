import fs from 'fs'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'

describe('generate-sw-version script', () => {
  it('gera public/sw-version.js a partir da versao do package.json', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gastometro-sw-version-'))
    const scriptsDir = path.join(tmpRoot, 'scripts')
    const publicDir = path.join(tmpRoot, 'public')

    fs.mkdirSync(scriptsDir, { recursive: true })
    fs.mkdirSync(publicDir, { recursive: true })

    const packageJsonPath = path.join(tmpRoot, 'package.json')
    fs.writeFileSync(packageJsonPath, JSON.stringify({ version: '9.9.9' }, null, 2), 'utf-8')

    const sourceScript = path.resolve(process.cwd(), 'scripts/generate-sw-version.js')
    const targetScript = path.join(scriptsDir, 'generate-sw-version.js')
    fs.copyFileSync(sourceScript, targetScript)

    execSync('node scripts/generate-sw-version.js', { cwd: tmpRoot, stdio: 'pipe' })

    const generatedPath = path.join(publicDir, 'sw-version.js')
    const generated = fs.readFileSync(generatedPath, 'utf-8')

    expect(generated).toBe("self.__APP_VERSION__ = '9.9.9'\n")

    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })
})
