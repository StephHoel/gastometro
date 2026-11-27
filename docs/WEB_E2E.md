# Testes E2E web

A suíte E2E valida o comportamento da versão web estática no mesmo subdiretório usado pelo GitHub Pages (`/gastometro/`), cobrindo roteamento SPA, comparação de preços e backup/restauração local com dados sintéticos representativos. Os testes usam Chromium controlado pelo Playwright e um servidor HTTP local que reproduz a resolução de arquivos estáticos e o fallback por 404.html.

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
3. O layout restaura o caminho salvo pelo 404 após a hidratação inicial, evitando divergência entre o HTML estático e a rota final.
4. Inicia um servidor HTTP local sob o caminho /gastometro/.
5. Executa os cenários em Chromium três vezes, criando um contexto de navegador independente para cada cenário.

## Cenários cobertos

- A raiz carrega a tela inicial e define o título esperado.
- A rota /calculator abre diretamente, sem navegação prévia.
- Atualizar a página em /calculator preserva a tela e a URL.
- Navegar pela interface permite alternar entre início, listas e calculadora; voltar/avançar do navegador valida o histórico entre início e calculadora.
- Uma rota inexistente recebe a resposta 404 do servidor estático, executa o redirecionamento de `404.html`, restaura o caminho original e exibe a tela própria `Página não encontrada`.
- O fluxo de comparação cadastra quatro lugares e um item com preços empatados, confere os destaques de menor e maior oferta e a diferença percentual, verifica a chave `gastometro-price-comparisons` no armazenamento local e recarrega a página para confirmar a persistência.\n- O fluxo de backup prepara dados sintéticos não vazios nas seis coleções (listas, produtos, lembretes, contas, locais e comparações), incluindo referências entre lembrete/lista/produto e preço/local. Exporta o JSON v2 e verifica IDs, valores e referências no conteúdo do arquivo.
- O mesmo fluxo importa o arquivo e confere os valores exatos das seis contagens, cancela a confirmação de substituição e verifica que a prévia continua disponível. Em seguida limpa as quatro chaves persistidas, recarrega a aplicação para simular uma instalação limpa, importa novamente e confirma a substituição. Por fim, lê as quatro chaves persistidas e verifica quantidades, campos, estado de coleta/pagamento, valores monetários, metadados e referências. Uma nova importação do mesmo arquivo valida a mesclagem idempotente: os registros idênticos permanecem únicos e inalterados.

O cenário funcional grava dados sintéticos apenas no contexto de navegador isolado do teste; nenhum dado real do usuário é acessado. Os demais cenários não escrevem dados de negócio. Cada cenário usa um contexto de navegador independente, isolando cookies, armazenamento e histórico. A validação falha diante de exceções JavaScript, erros no console, requisições malsucedidas ou recursos que retornem HTTP de erro. A resposta 404 do documento de rota inválida é esperada e validada separadamente, pois faz parte do fallback do GitHub Pages. Em caso de falha, a suíte salva screenshot e trace em `artifacts/web-e2e/`.

## Integração contínua

O workflow `Build APK and Release to GitHub`, no job `Roteamento web SPA`, executa a suíte em pull requests e em atualizações da `main`. Ele instala Node.js 24, dependências do projeto, verifica os tipos TypeScript e instala o Chromium. O job `Build and Release` declara dependência explícita de `Roteamento web SPA`, portanto o build Android não começa se o E2E falhar. Essa sequência foi confirmada no workflow 46021328819: o build Android iniciou somente após as três execuções E2E concluírem com sucesso. Quando há falha, publica os screenshots e traces disponíveis como artefatos da execução.

## Diagnóstico

A execução falha quando a build não é gerada, o servidor local não inicia, o Chromium não pode ser iniciado, a aplicação produz erro JavaScript ou algum critério de URL/tela não é atendido. O terminal identifica o cenário que falhou.

Se o navegador ainda não estiver instalado, repita a preparação do Chromium. Para depuração visual, abra o trace `artifacts/web-e2e/execucao-N-trace.zip` com `npx playwright show-trace` ou altere temporariamente `headless: true` para `headless: false` em `scripts/test-web-routing-e2e.ts`.

## Limitações

- A suíte cobre o roteamento web estático e o fallback SPA; não substitui testes E2E Android/iOS.
- O servidor local simula o comportamento de arquivos estáticos do GitHub Pages, mas não valida a infraestrutura externa do GitHub.
- O fluxo funcional de comparação cobre cadastro de lugares e item, comparação de empates e persistência.
- O fluxo funcional de backup cobre exportação e validação do conteúdo JSON v2 não vazio, pré-visualização das seis coleções, cancelamento da substituição, restauração em armazenamento limpo e conferência dos campos dos quatro stores persistidos, seguida de mesclagem idempotente de registros idênticos. O cenário passou nas três execuções do workflow 46021328819.
- A resolução individual dos seis tipos de conflito e as falhas de persistência/rollback são cobertas pela suíte de testes de interação e serviços, não por este cenário E2E.
- A suíte não substitui testes E2E Android/iOS nem valida todas as operações de edição e remoção.
- O escopo não inclui carga ou desempenho.
