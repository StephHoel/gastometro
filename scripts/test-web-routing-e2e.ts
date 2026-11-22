#!/usr/bin/env node
import type { IncomingMessage, Server, ServerResponse } from "node:http"

const assert = require("node:assert/strict")
const { spawnSync } = require("node:child_process")
const fs = require("node:fs")
const http = require("node:http")
const path = require("node:path")
const { delimiter } = require("node:path")

const ROOT = path.resolve(__dirname, "..")
const DIST = path.join(ROOT, "dist")
const BASE_PATH = "/gastometro"
const PORT = Number(process.env.E2E_PORT || 4173)
const BASE_URL = "http://127.0.0.1:" + PORT + BASE_PATH

function run(
  command: string,
  args: string[],
  options: import("node:child_process").SpawnSyncOptions = {},
): void {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  })
  if (result.status !== 0) {
    throw new Error("Comando falhou: " + command + " " + args.join(" "))
  }
}

function mimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase()
  const mimeTypes: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
  }
  return mimeTypes[extension] ?? "application/octet-stream"
}

function startStaticServer(): Promise<Server> {
  const server = http.createServer((request: IncomingMessage, response: ServerResponse) => {
    let pathname: string
    try {
      pathname = decodeURIComponent(new URL(request.url ?? "/", BASE_URL).pathname)
    } catch {
      response.writeHead(400).end("Requisição inválida")
      return
    }

    if (pathname !== BASE_PATH && !pathname.startsWith(BASE_PATH + "/")) {
      response.writeHead(404).end("Não encontrado")
      return
    }

    let relativePath = pathname.slice(BASE_PATH.length).replace(/^\/+/, "")
    if (!relativePath) relativePath = "index.html"
    let target = path.resolve(DIST, relativePath)

    if (!target.startsWith(DIST + path.sep) && target !== path.join(DIST, "index.html")) {
      response.writeHead(403).end("Acesso negado")
      return
    }

    try {
      const candidates = [target]
      if (!path.extname(target)) {
        candidates.push(target + ".html", path.join(target, "index.html"))
      }
      target = candidates.find(candidate =>
        candidate.startsWith(DIST + path.sep) &&
        fs.existsSync(candidate) &&
        fs.statSync(candidate).isFile()
      ) as string

      if (target) {
        response.writeHead(200, { "content-type": mimeType(target) })
        fs.createReadStream(target).pipe(response)
        return
      }

      const fallback = path.join(DIST, "404.html")
      if (fs.existsSync(fallback)) {
        response.writeHead(404, { "content-type": "text/html; charset=utf-8" })
        fs.createReadStream(fallback).pipe(response)
        return
      }
      response.writeHead(404).end("Não encontrado")
    } catch {
      response.writeHead(500).end("Erro ao servir arquivo")
    }
  })

  return new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(PORT, "127.0.0.1", () => resolve(server))
  })
}

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL + "/")
      if (response.status === 200) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error("Servidor web não ficou disponível em até 30 segundos.")
}

function loadPlaywright(): any {
  const packageEntry = (process.env.PATH ?? "")
    .split(delimiter)
    .map((directory: string) => path.resolve(directory, "..", "playwright", "index.js"))
    .find((candidate: string) => fs.existsSync(candidate))

  if (!packageEntry) {
    throw new Error("Playwright não foi encontrado. Execute o comando pelo script npm.")
  }
  return require(packageEntry)
}

async function runScenario(name: string, action: () => Promise<void>, pageErrors: string[]): Promise<void> {
  await action()
  assert.deepEqual(pageErrors, [], "A aplicação apresentou erro JavaScript")
  process.stdout.write("  ✓ " + name + "\n")
}

async function runSuite(browser: any, cycle: number): Promise<void> {
  const context = await browser.newContext()
  const page = await context.newPage()
  const pageErrors: string[] = []
  const artifactsDirectory = path.join(ROOT, "artifacts", "web-e2e")
  page.on("pageerror", (error: Error) => pageErrors.push(error.message))
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true })

  try {
    await runScenario("raiz carrega a tela inicial", async () => {
      const response = await page.goto(BASE_URL + "/", { waitUntil: "networkidle" })
      assert.equal(response.status(), 200)
      await page.getByText("Total Geral:", { exact: false }).waitFor()
      assert.equal(new URL(page.url()).pathname, BASE_PATH + "/")
      assert.equal(await page.title(), "Gastômetro")
    }, pageErrors)

    await runScenario("rota profunda abre diretamente", async () => {
      const response = await page.goto(BASE_URL + "/calculator", { waitUntil: "networkidle" })
      assert.ok(response.status() === 200 || response.status() === 404)
      await page.getByText("Calculadora", { exact: true }).last().waitFor()
      assert.equal(new URL(page.url()).pathname, BASE_PATH + "/calculator")
      assert.equal(await page.title(), "Calculadora")
    }, pageErrors)

    await runScenario("atualização mantém a rota profunda", async () => {
      await page.reload({ waitUntil: "networkidle" })
      await page.getByText("Calculadora", { exact: true }).last().waitFor()
      assert.equal(new URL(page.url()).pathname, BASE_PATH + "/calculator")
      assert.equal(await page.title(), "Calculadora")
    }, pageErrors)

    await runScenario("rota de listas abre diretamente", async () => {
      const response = await page.goto(BASE_URL + "/lists", { waitUntil: "networkidle" })
      assert.ok(response.status() === 200 || response.status() === 404)
      await page.getByPlaceholder("Nome da lista").waitFor()
      assert.equal(new URL(page.url()).pathname, BASE_PATH + "/lists")
      assert.equal(await page.title(), "Listas")
    }, pageErrors)

    await runScenario("atualização mantém a rota de listas", async () => {
      await page.reload({ waitUntil: "networkidle" })
      await page.getByPlaceholder("Nome da lista").waitFor()
      assert.equal(new URL(page.url()).pathname, BASE_PATH + "/lists")
      assert.equal(await page.title(), "Listas")
    }, pageErrors)

    await runScenario("navegação e histórico do navegador funcionam", async () => {
      await page.goto(BASE_URL + "/", { waitUntil: "networkidle" })
      await page.getByText("Calculadora", { exact: true }).last().click()
      await page.getByText("Calculadora", { exact: true }).last().waitFor()
      assert.equal(new URL(page.url()).pathname, BASE_PATH + "/calculator")
      await page.goBack({ waitUntil: "networkidle" })
      await page.getByText("Total Geral:", { exact: false }).waitFor()
      assert.equal(new URL(page.url()).pathname, BASE_PATH + "/")
      await page.goForward({ waitUntil: "networkidle" })
      assert.equal(new URL(page.url()).pathname, BASE_PATH + "/calculator")
    }, pageErrors)

    await runScenario("rota inexistente preserva o caminho no fallback SPA", async () => {
      const invalidPath = BASE_PATH + "/rota-inexistente-e2e"
      await page.goto("http://127.0.0.1:" + PORT + invalidPath, { waitUntil: "networkidle" })
      await page.waitForFunction((expected: string) => window.location.pathname === expected, invalidPath)
      assert.equal(new URL(page.url()).pathname, invalidPath)
      assert.ok(await page.locator("body").innerText())
    }, pageErrors)
  } catch (error) {
    fs.mkdirSync(artifactsDirectory, { recursive: true })
    const artifactPrefix = "execucao-" + cycle
    await page.screenshot({ path: path.join(artifactsDirectory, artifactPrefix + ".png"), fullPage: true }).catch(() => undefined)
    await context.tracing.stop({ path: path.join(artifactsDirectory, artifactPrefix + "-trace.zip") }).catch(() => undefined)
    throw error
  } finally {
    await context.close()
  }
  process.stdout.write("Execução " + cycle + "/3 concluída.\n")
}

async function main(): Promise<void> {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm"
  const node = process.execPath

  process.stdout.write("Gerando build web compatível com GitHub Pages...\n")
  run(npm, ["run", "web:build"], {
    env: { ...process.env, EXPO_PUBLIC_ROUTER_BASE: BASE_PATH },
  })

  for (const file of ["404.html", "sw.js", "sw-version.js"]) {
    const source = path.join(ROOT, "public", file)
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(DIST, file))
  }
  run(node, [path.join(ROOT, "scripts", "inject-spa-routing.js")])

  const server = await startStaticServer()
  let browser: any
  try {
    await waitForServer()
    const { chromium } = loadPlaywright()
    browser = await chromium.launch({ headless: true })
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      process.stdout.write("\nExecução E2E " + cycle + "/3\n")
      await runSuite(browser, cycle)
    }
    process.stdout.write("\nTodos os cenários E2E passaram nas três execuções.\n")
  } finally {
    if (browser) await browser.close()
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
}

main().catch((error: unknown) => {
  console.error("\nFalha na suíte E2E:", error)
  process.exitCode = 1
})
