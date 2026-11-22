# Testes E2E do roteamento web

A suíte E2E valida o comportamento da versão web estática no mesmo subdiretório usado pelo GitHub Pages (/gastometro/). Os testes usam Chromium controlado pelo Playwright e um servidor HTTP local que reproduz a resolução de arquivos estáticos e o fallback por 404.html.

## Requisitos

- Node.js 24 e npm 11, conforme a configuração do projeto.
- Conexão com a internet na primeira execução para obter temporariamente o Playwright e instalar o Chromium.
- Dependências do projeto instaladas com npm install.

## Preparação do navegador

Execute uma vez:

```bash
npx --yes --package=playwright@1.56.1 playwright install chromium
```

Playwright e tsx são obtidos temporariamente pelo npx, sem adicionar dependências de desenvolvimento nem alterar o lockfile do aplicativo.

## Executar

```bash
npm run test:e2e:web
```

O comando:

1. Gera a build estática com EXPO_PUBLIC_ROUTER_BASE=/gastometro.
2. Copia os arquivos de fallback e Service Worker usados no deploy.
3. Injeta o script de restauração de rota no index.html.
4. Inicia um servidor HTTP local sob o caminho /gastometro/.
5. Executa os cenários em Chromium três vezes, criando um contexto de navegador independente para cada cenário.

## Cenários cobertos

- A raiz carrega a tela inicial e define o título esperado.
- A rota /calculator abre diretamente, sem navegação prévia.
- Atualizar a página em /calculator preserva a tela e a URL.
- Navegar pela interface permite alternar entre início, listas e calculadora; voltar/avançar do navegador valida o histórico entre início e calculadora.
- Uma rota inexistente recebe a resposta 404 do servidor estático, executa o redirecionamento de 404.html, restaura o caminho original e exibe a tela própria `Página não encontrada`.

Os testes não escrevem dados de negócio nem alteram o formato de persistência. Cada cenário usa um contexto de navegador independente, isolando cookies, armazenamento e histórico. A validação falha diante de exceções JavaScript, erros no console, requisições malsucedidas ou recursos que retornem HTTP de erro. Em caso de falha, a suíte salva screenshot e trace em `artifacts/web-e2e/`.

## Integração contínua

O workflow `Testes E2E Web` executa a suíte em pull requests direcionados à `main` e em atualizações da própria `main`. Ele instala Node.js 24, dependências do projeto e Chromium. Quando há falha, publica os screenshots e traces disponíveis como artefatos da execução.

## Diagnóstico

A execução falha quando a build não é gerada, o servidor local não inicia, o Chromium não pode ser iniciado, a aplicação produz erro JavaScript ou algum critério de URL/tela não é atendido. O terminal identifica o cenário que falhou.

Se o navegador ainda não estiver instalado, repita a preparação do Chromium. Para depuração visual, abra o trace `artifacts/web-e2e/execucao-N-trace.zip` com `npx playwright show-trace` ou altere temporariamente `headless: true` para `headless: false` em `scripts/test-web-routing-e2e.ts`.

## Limitações

- A suíte cobre o roteamento web estático e o fallback SPA; não substitui testes E2E Android/iOS.
- O servidor local simula o comportamento de arquivos estáticos do GitHub Pages, mas não valida a infraestrutura externa do GitHub.
- O escopo não inclui carga, desempenho ou validação funcional completa das telas.
