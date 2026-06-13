# Mini-spec: Service Worker para funcionamento offline em web

Número: 13
Status: planejado

## Problema

A versão web do Gastômetro (hospedada no GitHub Pages) não possui suporte offline atualmente. Ao perder conexão com a internet, o app falha ao carregar recursos. Usuários em transporte público ou em áreas com conexão instável precisam de acesso confiável ao aplicativo mesmo offline.

## Objetivo

Implementar um Service Worker que funcione com a build web do Gastômetro hospedada no GitHub Pages, permitindo que:

- O app carregue mesmo sem conexão de rede
- Todos os recursos necessários (JS, CSS, imagens) sejam cacheados
- Os dados do usuário (lista de compras) permaneçam acessíveis offline via AsyncStorage
- O app funcione offline-first também na plataforma web

## Comportamento esperado

### Carregamento inicial (online ou offline)

- O Service Worker é registrado ao iniciar a aplicação web.
- Todos os assets da build são cacheados na primeira visita bem-sucedida.
- Versão do cache é identificada pela versão do app em `package.json`.

### Funcionamento offline

- Ao perder conexão, recursos já cacheados são servidos imediatamente sem tentativa de rede.
- O app continua funcionável com os dados persistidos em AsyncStorage/localStorage.
- Funções que dependem de rede (se houver no futuro) devem falhar graciosamente com mensagem ao usuário.

### Atualização de cache

- O Service Worker verifica atualizações a cada carregamento da página (se online).
- Após uma atualização de versão do app, o cache antigo é removido e um novo é criado.
- O usuário não é interrompido durante a transição de versão.

### Compatibilidade com GitHub Pages

- O cache deve considerar o prefixo `/gastometro` definido em `EXPO_PUBLIC_ROUTER_BASE`.
- Todos os caminhos de recursos devem ser corretos em relação à raiz do subdiretório.

## Telas afetadas

- Todas as telas da versão web.
- Sem impacto visual direto, apenas no funcionamento offline.

## Dados e persistência

- Dados do usuário (lista de compras) continuam persistidos via AsyncStorage no navegador (convertido para localStorage/IndexedDB na web).
- Service Worker não deve interferir com a persistência existente.
- Cache de assets é independente e gerenciado separadamente.

## Regras de validação

- O Service Worker deve aceitar requisições GET para recursos estáticos (JS, CSS, imagens, fontes).
- Requisições POST/PUT/DELETE devem ser deixadas passar para rede (sem implementação de sincronização offline por enquanto).
- Cache deve ser validado por versão, não apenas por tempo.
- Recursos ausentes no cache devem tentar carregamento de rede e retornar erro 404 se offline e não cacheado.

## Critérios de aceite

- [ ] Service Worker registrado com sucesso na inicialização web.
- [ ] Assets principais (bundle JS, CSS, imagens) são cacheados após primeira visita online.
- [ ] Página carrega completamente offline (sem erros de rede).
- [ ] Lista de compras permanece acessível e editável offline.
- [ ] Ao voltar online, app detecta atualizações e atualiza o cache se necessário.
- [ ] Cache é limpado quando versão do app muda.
- [ ] Funciona corretamente com rotas em subdiretório (`/gastometro`).
- [ ] Compatível com Firefox, Chrome e Safari no navegador.

## Arquitetura proposta

### Estrutura de arquivos

```plain
public/
  sw.js                      # Service Worker principal
src/
  services/
    ServiceWorkerService.ts  # Hook/service para registrar SW
```

### Implementação recomendada

#### 1. Service Worker (`public/sw.js`)

- Definir nome do cache com versão: `cache-v${APP_VERSION}`.
- Listar todos os assets para pré-cache (arquivos estáticos conhecidos).
- Implementar estratégia de cache: "cache first, fallback to network".
- Limpar versões antigas do cache ao instalar nova versão.
- Servir página raiz (`/gastometro` ou `/gastometro/`) em caso de erro 404 (para SPA routing).

#### 2. Service (`src/services/ServiceWorkerService.ts`)

- Registrar o Service Worker ao montar a app.
- Tratamento de erros silencioso (não quebrar se SW não suportado).
- Detectar atualizações e opcionalmente notificar o usuário.

#### 3. Integração com Expo

- Service Worker não interfere com a stack Expo/React Native no Android.
- Ativado apenas na plataforma web (condicional ao ambiente).

## Fora de escopo

- Sincronização background de dados.
- Estratégia de atualização automática com notificação ao usuário.
- Limpeza de cache por política de tempo (TTL).
- Suporte a requisições de escrita (POST/PUT/DELETE) offline com fila.
- Notificações push.

## Observações para IA

- O Service Worker é um padrão PWA e deve seguir boas práticas da comunidade.
- Testar localmente com `npm run web` e validar funcionamento offline com DevTools.
- Certificar compatibilidade com o build web gerado por Expo e o prefixo `/gastometro` do GitHub Pages.
- Ao implementar, gerar ou atualizar testes unitários para `ServiceWorkerService` conforme cobertura existente.
- Considerar criar docs/SW_OFFLINE.md após implementação para orientar usuários e desenvolvedores futuros.

## Registro de implementação

- 2026-06-13: mini-spec criada em `planned/`.
