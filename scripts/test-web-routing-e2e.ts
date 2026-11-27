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

async function runScenario(
  browser: any,
  name: string,
  action: (page: any) => Promise<void>,
  cycle: number,
): Promise<void> {
  const context = await browser.newContext({ acceptDownloads: true })
  const page = await context.newPage()
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  const failedRequests: string[] = []
  const failedResources: string[] = []
  const artifactsDirectory = path.join(ROOT, "artifacts", "web-e2e")
  const artifactPrefix = "execucao-" + cycle + "-" + name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()

  page.on("pageerror", (error: Error) => pageErrors.push(error.message))
  page.on("console", (message: any) => {
    const text = message.text()
    const expectedStaticFallback404 =
      text.includes("Failed to load resource") && text.includes("404 (Not Found)")

    if (message.type() === "error" && !expectedStaticFallback404) {
      consoleErrors.push(text)
    }
  })
  page.on("requestfailed", (request: any) => {
    failedRequests.push(request.url() + ": " + (request.failure()?.errorText ?? "falha desconhecida"))
  })
  page.on("response", (response: any) => {
    if (response.status() >= 400 && response.request().resourceType() !== "document") {
      failedResources.push(response.url() + ": HTTP " + response.status())
    }
  })
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true })

  try {
    await action(page)
    assert.equal(pageErrors.length, 0, "Exceções JavaScript:\\n" + pageErrors.join("\\n"))
    assert.equal(failedRequests.length, 0, "Requisições malsucedidas:\\n" + failedRequests.join("\\n"))
    assert.equal(failedResources.length, 0, "Recursos com HTTP de erro:\\n" + failedResources.join("\\n"))
    assert.equal(consoleErrors.length, 0, "Erros no console:\\n" + consoleErrors.join("\\n"))
    await context.tracing.stop()
    process.stdout.write("  ✓ " + name + "\n")
  } catch (error) {
    fs.mkdirSync(artifactsDirectory, { recursive: true })
    await page.screenshot({ path: path.join(artifactsDirectory, artifactPrefix + ".png"), fullPage: true }).catch(() => undefined)
    await context.tracing.stop({ path: path.join(artifactsDirectory, artifactPrefix + "-trace.zip") }).catch(() => undefined)
    throw error
  } finally {
    await context.close()
  }
}

async function runSuite(browser: any, cycle: number): Promise<void> {
  const run = (name: string, action: (page: any) => Promise<void>) =>
    runScenario(browser, name, action, cycle)

  await run("raiz carrega a tela inicial", async page => {
    const response = await page.goto(BASE_URL + "/", { waitUntil: "networkidle" })
    assert.equal(response.status(), 200)
    await page.getByText("Total Geral:", { exact: false }).waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/")
    assert.equal(await page.title(), "Gastômetro")
  })

  await run("rota profunda abre diretamente", async page => {
    const response = await page.goto(BASE_URL + "/calculator", { waitUntil: "networkidle" })
    assert.ok(response.status() === 200 || response.status() === 404)
    await page.getByText("Calculadora", { exact: true }).last().waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/calculator")
    assert.equal(await page.title(), "Calculadora")
  })

  await run("atualização mantém a rota profunda", async page => {
    const response = await page.goto(BASE_URL + "/calculator", { waitUntil: "networkidle" })
    assert.ok(response.status() === 200 || response.status() === 404)
    await page.getByText("Calculadora", { exact: true }).last().waitFor()
    await page.reload({ waitUntil: "networkidle" })
    await page.getByText("Calculadora", { exact: true }).last().waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/calculator")
    assert.equal(await page.title(), "Calculadora")
  })

  await run("rota de listas abre diretamente", async page => {
    const response = await page.goto(BASE_URL + "/lists", { waitUntil: "networkidle" })
    assert.ok(response.status() === 200 || response.status() === 404)
    await page.getByPlaceholder("Nome da lista").waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/lists")
    assert.equal(await page.title(), "Listas")
  })

  await run("atualização mantém a rota de listas", async page => {
    const response = await page.goto(BASE_URL + "/lists", { waitUntil: "networkidle" })
    assert.ok(response.status() === 200 || response.status() === 404)
    await page.getByPlaceholder("Nome da lista").waitFor()
    await page.reload({ waitUntil: "networkidle" })
    await page.getByPlaceholder("Nome da lista").waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/lists")
    assert.equal(await page.title(), "Listas")
  })

  await run("navegação entre telas e histórico do navegador funcionam", async page => {
    await page.goto(BASE_URL + "/", { waitUntil: "networkidle" })

    await page.getByText("Listas", { exact: true }).last().click()
    await page.waitForURL("**/gastometro/lists")
    await page.getByPlaceholder("Nome da lista").waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/lists")

    await page.getByText("Calculadora", { exact: true }).last().click()
    await page.waitForURL("**/gastometro/calculator")
    await page.getByPlaceholder("Preço da Embalagem").waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/calculator")

    await page.goBack({ waitUntil: "networkidle" })
    await page.waitForURL("**/gastometro/")
    await page.getByText("Total Geral:", { exact: false }).waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/")

    await page.goForward({ waitUntil: "networkidle" })
    await page.waitForURL("**/gastometro/calculator")
    await page.getByPlaceholder("Preço da Embalagem").waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/calculator")
  })

  await run("rota inexistente executa o fallback SPA e preserva o caminho", async page => {
    const invalidPath = BASE_PATH + "/rota-inexistente-e2e"
    let fallbackStatus: number | undefined
    page.on("response", (response: any) => {
      if (new URL(response.url()).pathname === invalidPath) {
        fallbackStatus = response.status()
      }
    })

    await page.goto("http://127.0.0.1:" + PORT + invalidPath, { waitUntil: "networkidle" })
    await page.waitForFunction(
      (expected: string) => window.location.pathname === expected,
      invalidPath,
      { timeout: 10000 },
    ).catch(async (error: Error) => {
      const state = await page.evaluate(() => ({
        pathname: window.location.pathname,
        redirect: window.sessionStorage.getItem("redirect"),
        baseURI: document.baseURI,
        title: document.title,
      }))
      throw new Error("A rota original não foi restaurada: " + JSON.stringify(state) + ". " + error.message)
    })
    await page.getByText("Página não encontrada", { exact: true }).waitFor()

    assert.equal(fallbackStatus, 404, "A rota inexistente deve ser atendida pelo arquivo 404.html")
    assert.equal(new URL(page.url()).pathname, invalidPath)
    assert.notEqual((await page.locator("body").innerText()).trim(), "")
    assert.ok(
      !(await page.locator("body").innerText()).includes("Redirecionando..."),
      "A página não deve permanecer no documento de redirecionamento",
    )
  })


  await run("comparação de preços cadastra lugares e item, destaca empates e persiste após recarregar", async page => {
    await page.goto(BASE_URL + "/", { waitUntil: "networkidle" })
    await page.getByText("Preços", { exact: true }).last().click()
    await page.getByText("Nenhum lugar cadastrado ainda.", { exact: true }).waitFor()

    const places = ["Mercado A", "Mercado B", "Mercado C", "Mercado D"]
    for (const place of places) {
      await page.getByRole("button", { name: "Cadastrar lugar" }).last().click()
      await page.getByLabel("Lugar Input").last().fill(place)
      await page.getByText("Adicionar lugar", { exact: true }).last().click()
      await page.getByText(place, { exact: true }).last().waitFor()
      await page.goto(BASE_URL + "/price-comparison", { waitUntil: "networkidle" })
    }

    await page.getByRole("button", { name: "Cadastrar item" }).last().click()
    await page.getByLabel("Nome do item Input").last().fill("Leite")
    await page.getByLabel("Referência de quantidade Input").last().fill("1 litro")
    await page.getByLabel("Preço em Mercado A Input").last().fill("5,00")
    await page.getByLabel("Preço em Mercado B Input").last().fill("5,00")
    await page.getByLabel("Preço em Mercado C Input").last().fill("10,00")
    await page.getByLabel("Preço em Mercado D Input").last().fill("10,00")
    await page.getByText("Adicionar item", { exact: true }).last().click()

    await page.getByText("Mercado A · Melhor preço", { exact: true }).last().waitFor()
    await page.getByText("Mercado B · Melhor preço", { exact: true }).last().waitFor()
    await page.getByText("Mercado C · Maior preço", { exact: true }).last().waitFor()
    await page.getByText("Mercado D · Maior preço", { exact: true }).last().waitFor()
    await page.getByText("Maior preço: Mercado C, Mercado D (R$ 10,00)", { exact: true }).last().waitFor()
    await page.getByText("Economia possível: R$ 5,00 (50,0%)", { exact: true }).last().waitFor()

    const persistedBeforeReload = await page.evaluate(() =>
      window.localStorage.getItem("gastometro-price-comparisons")
    )
    assert.ok(persistedBeforeReload, "A comparação deve ser persistida no armazenamento local")
    const persistedState = JSON.parse(persistedBeforeReload)
    assert.equal(persistedState.state.places.length, 4)
    assert.equal(persistedState.state.entries.length, 1)
    assert.equal(persistedState.state.entries[0].itemName, "Leite")

    await page.reload({ waitUntil: "networkidle" })
    await page.getByText("Mercado A · Melhor preço", { exact: true }).last().waitFor()
    await page.getByText("Mercado B · Melhor preço", { exact: true }).last().waitFor()
    await page.getByText("Mercado C · Maior preço", { exact: true }).last().waitFor()
    await page.getByText("Mercado D · Maior preço", { exact: true }).last().waitFor()
    await page.getByText("Maior preço: Mercado C, Mercado D (R$ 10,00)", { exact: true }).last().waitFor()
    assert.equal(new URL(page.url()).pathname, BASE_PATH + "/price-comparison")
  })


  await run("backup web exporta e restaura dados reais das seis coleções", async page => {
    const fixture = {
      cart: { state: { lists: [{ id: "e2e-list-001", name: "Lista E2E", products: [{ id: "e2e-product-001", quantity: "2", item: "Arroz E2E", price: "25.90", collected: true }] }], activeListId: "e2e-list-001", products: [{ id: "e2e-product-001", quantity: "2", item: "Arroz E2E", price: "25.90", collected: true }] }, version: 3 },
      reminders: { state: { reminders: [{ id: "e2e-reminder-001", title: "Lembrete E2E", datetimeISO: "2026-12-01T10:00:00.000Z", enabled: true, listId: "e2e-list-001", itemId: "e2e-product-001", createdAt: "2026-11-27T10:00:00.000Z", updatedAt: "2026-11-27T10:00:00.000Z" }] }, version: 3 },
      bills: { state: { bills: [{ id: "e2e-bill-001", title: "Conta E2E", amount: "125.90", paid: false }] }, version: 1 },
      priceComparison: { state: { places: [{ id: "e2e-place-001", name: "Mercado E2E", note: "Local de teste" }], entries: [{ id: "e2e-entry-001", itemName: "Feijão E2E", quantityReference: "1 kg", pricesByPlace: [{ placeId: "e2e-place-001", price: "8.75" }], createdAt: "2026-11-27T10:00:00.000Z", updatedAt: "2026-11-27T10:00:00.000Z" }] }, version: 1 },
    }

    await page.addInitScript((data: any) => {
      if (window.sessionStorage.getItem("e2e-backup-clean-install") === "true") return
      window.localStorage.setItem("gastometro", JSON.stringify(data.cart))
      window.localStorage.setItem("gastometro-reminders", JSON.stringify(data.reminders))
      window.localStorage.setItem("gastometro-bills", JSON.stringify(data.bills))
      window.localStorage.setItem("gastometro-price-comparisons", JSON.stringify(data.priceComparison))
    }, fixture)
    await page.goto(BASE_URL + "/backup", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Gerar backup" }).waitFor()

    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("button", { name: "Gerar backup" }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    assert.ok(downloadPath, "O navegador deve disponibilizar o arquivo JSON exportado")
    const backupJson = fs.readFileSync(downloadPath, "utf8")
    const envelope = JSON.parse(backupJson)
    assert.equal(envelope.format, "gastometro-backup")
    assert.equal(envelope.version, 2)
    const exported = envelope.payload
    assert.equal(exported.cart.lists[0].products[0].item, "Arroz E2E")
    assert.equal(exported.reminders[0].itemId, "e2e-product-001")
    assert.equal(exported.bills[0].title, "Conta E2E")
    assert.equal(exported.priceComparison.places[0].name, "Mercado E2E")
    assert.equal(exported.priceComparison.entries[0].pricesByPlace[0].placeId, "e2e-place-001")
    assert.equal(exported.priceComparison.entries[0].pricesByPlace[0].price, "8.75")

    const uploadBackup = async () => {
      const chooserPromise = page.waitForEvent("filechooser")
      await page.getByRole("button", { name: "Selecionar arquivo JSON" }).click()
      const chooser = await chooserPromise
      await chooser.setFiles({ name: "gastometro-backup-e2e.json", mimeType: "application/json", buffer: Buffer.from(backupJson, "utf8") })
      await page.getByRole("button", { name: "Validar e visualizar" }).click()
      await page.getByText("Resumo do backup", { exact: true }).waitFor()
      for (const summary of ["Listas: 1", "Produtos: 1", "Lembretes: 1", "Contas: 1", "Locais de comparação: 1", "Comparações de preços: 1"]) {
        await page.getByText(summary, { exact: true }).waitFor()
      }
    }

    await uploadBackup()
    const replaceButton = page.getByRole("button", { name: "Substituir dados locais" })
    const cancelDialogPromise = page.waitForEvent("dialog")
    const cancelClickPromise = replaceButton.click()
    const cancelDialog = await cancelDialogPromise
    assert.equal(cancelDialog.type(), "confirm")
    assert.ok(cancelDialog.message().includes("Todas as listas"))
    await cancelDialog.dismiss()
    await cancelClickPromise

    // Cancelar a confirmação não pode alterar nenhum dos quatro stores locais.
    const unchangedAfterCancel = await page.evaluate(() => ({
      cart: JSON.parse(window.localStorage.getItem("gastometro") || "null"),
      reminders: JSON.parse(window.localStorage.getItem("gastometro-reminders") || "null"),
      bills: JSON.parse(window.localStorage.getItem("gastometro-bills") || "null"),
      priceComparison: JSON.parse(window.localStorage.getItem("gastometro-price-comparisons") || "null"),
    }))
    assert.equal(unchangedAfterCancel.cart.state.lists[0].id, "e2e-list-001")
    assert.equal(unchangedAfterCancel.reminders.state.reminders[0].id, "e2e-reminder-001")
    assert.equal(unchangedAfterCancel.bills.state.bills[0].id, "e2e-bill-001")
    assert.equal(unchangedAfterCancel.priceComparison.state.entries[0].id, "e2e-entry-001")
    await page.getByText("Resumo do backup", { exact: true }).waitFor()

    // Simula instalação limpa e restaura o arquivo exportado, verificando os quatro stores.
    await page.evaluate(() => {
      window.sessionStorage.setItem("e2e-backup-clean-install", "true")
      window.localStorage.clear()
    })
    await page.reload({ waitUntil: "networkidle" })
    await uploadBackup()
    const confirmDialogPromise = page.waitForEvent("dialog")
    const confirmClickPromise = page.getByRole("button", { name: "Substituir dados locais" }).click()
    const confirmation = await confirmDialogPromise
    assert.equal(confirmation.type(), "confirm")
    assert.ok(confirmation.message().includes("Todas as listas"))
    await confirmation.accept()
    await confirmClickPromise
    await page.getByText(/Restauração concluída/).waitFor()

    const readPersistedStores = () => page.evaluate(() => ({
      cart: JSON.parse(window.localStorage.getItem("gastometro") || "null"),
      reminders: JSON.parse(window.localStorage.getItem("gastometro-reminders") || "null"),
      bills: JSON.parse(window.localStorage.getItem("gastometro-bills") || "null"),
      priceComparison: JSON.parse(window.localStorage.getItem("gastometro-price-comparisons") || "null"),
    }))
    const assertCompleteRestore = (restored: any) => {
      assert.equal(restored.cart.state.lists.length, 1)
      assert.equal(restored.cart.state.lists[0].id, "e2e-list-001")
      assert.equal(restored.cart.state.lists[0].name, "Lista E2E")
      assert.equal(restored.cart.state.lists[0].products.length, 1)
      assert.equal(restored.cart.state.lists[0].products[0].id, "e2e-product-001")
      assert.equal(restored.cart.state.lists[0].products[0].item, "Arroz E2E")
      assert.equal(restored.cart.state.lists[0].products[0].quantity, "2")
      assert.equal(restored.cart.state.lists[0].products[0].price, "25.90")
      assert.equal(restored.cart.state.lists[0].products[0].collected, true)
      assert.equal(restored.cart.state.activeListId, "e2e-list-001")
      assert.equal(restored.cart.state.products.length, 1)

      assert.equal(restored.reminders.state.reminders.length, 1)
      assert.equal(restored.reminders.state.reminders[0].id, "e2e-reminder-001")
      assert.equal(restored.reminders.state.reminders[0].listId, "e2e-list-001")
      assert.equal(restored.reminders.state.reminders[0].itemId, "e2e-product-001")
      assert.equal(restored.reminders.state.reminders[0].enabled, true)
      assert.equal(restored.reminders.state.reminders[0].title, "Lembrete E2E")
      assert.equal(Object.hasOwn(restored.reminders.state.reminders[0], "notificationId"), false)

      assert.equal(restored.bills.state.bills.length, 1)
      assert.equal(restored.bills.state.bills[0].id, "e2e-bill-001")
      assert.equal(restored.bills.state.bills[0].title, "Conta E2E")
      assert.equal(restored.bills.state.bills[0].amount, "125.90")
      assert.equal(restored.bills.state.bills[0].paid, false)

      assert.equal(restored.priceComparison.state.places.length, 1)
      assert.equal(restored.priceComparison.state.places[0].id, "e2e-place-001")
      assert.equal(restored.priceComparison.state.places[0].name, "Mercado E2E")
      assert.equal(restored.priceComparison.state.places[0].note, "Local de teste")
      assert.equal(restored.priceComparison.state.entries.length, 1)
      assert.equal(restored.priceComparison.state.entries[0].id, "e2e-entry-001")
      assert.equal(restored.priceComparison.state.entries[0].itemName, "Feijão E2E")
      assert.equal(restored.priceComparison.state.entries[0].quantityReference, "1 kg")
      assert.equal(restored.priceComparison.state.entries[0].pricesByPlace.length, 1)
      assert.equal(restored.priceComparison.state.entries[0].pricesByPlace[0].placeId, "e2e-place-001")
      assert.equal(restored.priceComparison.state.entries[0].pricesByPlace[0].price, "8.75")
      assert.equal(restored.priceComparison.state.entries[0].createdAt, "2026-11-27T10:00:00.000Z")
      assert.equal(restored.priceComparison.state.entries[0].updatedAt, "2026-11-27T10:00:00.000Z")
    }

    assertCompleteRestore(await readPersistedStores())

    // Mesclar o mesmo arquivo deve ignorar todos os registros idênticos, sem duplicá-los.
    await uploadBackup()
    await page.getByRole("button", { name: "Mesclar com dados locais" }).click()
    await page.getByText(/Restauração concluída/).waitFor()
    await page.getByText("Resumo do backup", { exact: true }).waitFor({ state: "detached" })
    assertCompleteRestore(await readPersistedStores())
  })

  process.stdout.write("Execução " + cycle + "/3 concluída.\\n")
}

async function main(): Promise<void> {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm"

  process.stdout.write("Gerando build web compatível com GitHub Pages...\n")
  run(npm, ["run", "web:build"], {
    env: { ...process.env, EXPO_PUBLIC_ROUTER_BASE: BASE_PATH },
  })

  for (const file of ["404.html", "sw.js", "sw-version.js"]) {
    const source = path.join(ROOT, "public", file)
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(DIST, file))
  }

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
