# Deploy Web do Gastômetro

Este documento detalha o processo de build, teste e deploy da versão web do Gastômetro no GitHub Pages.

## Build Web Estática

Para gerar uma build web estática compatível com GitHub Pages:

```bash
npm run web:build
```

A build será gerada no diretório `dist/` e será totalmente estática, sem necessidade de backend.

### Variáveis de Ambiente de Build

O Expo Router necessita da variável `EXPO_PUBLIC_ROUTER_BASE` para configurar corretamente as rotas quando a aplicação é servida em um subdiretório do GitHub Pages.

Para GitHub Pages (subdiretório `/gastometro/`):

```bash
EXPO_PUBLIC_ROUTER_BASE=/gastometro npm run web:build
```

Para testes locais (root path):

```bash
EXPO_PUBLIC_ROUTER_BASE=/ npm run web:build
```

**Nota:** O workflow automático (`.github/workflows/deploy-web.yml`) já possui essa configuração definida.

### Estrutura da Build

- `dist/index.html` - HTML principal
- `dist/**/*.js` - JavaScript compilado
- `dist/**/*.css` - Estilos compilados
- `dist/**/*.png` - Imagens otimizadas

## Teste Local

Para testar a build localmente antes de fazer deploy, você pode simular o ambiente do GitHub Pages:

### Teste com GitHub Pages (subdiretório)

```bash
EXPO_PUBLIC_ROUTER_BASE=/gastometro npm run web:build
npm run web:serve
```

Depois abra seu navegador em `http://localhost:3000`.

### Teste com root path (padrão)

```bash
npm run web:build
npm run web:serve
```

**Testes recomendados:**

- Tela principal (adicionar, editar, remover itens)
- Marcação de itens como coletados
- Calculadora
- Navegação entre abas (home e calculadora)
- Compartilhamento via WhatsApp (abrirá wa.me)
- Importação de lista copiada
- Persistência de dados (recarregue a página)

## Deploy Automático

O deploy automático é executado via GitHub Actions quando há push na branch `main`.

Workflow: `.github/workflows/deploy-web.yml`

**O que o workflow faz:**

1. Faz checkout do código
2. Instala dependências com npm
3. Roda verificação de tipos (TypeScript)
4. Configura variável de ambiente `EXPO_PUBLIC_ROUTER_BASE=/gastometro`
5. Gera build web com `expo export --platform web`
6. Copia arquivo `404.html` para configurar SPA routing
7. Injeta script de redirecionamento no `index.html`
8. Cria arquivo `.nojekyll` para desabilitar Jekyll
9. Faz upload dos artefatos para GitHub Pages
10. Deployment automático no ambiente de GitHub Pages

## SPA Routing no GitHub Pages

O GitHub Pages não suporta nativamente roteamento SPA (Single Page Application). A solução implementada utiliza dois mecanismos:

### 1. Arquivo `404.html` (public/404.html)

Quando o navegador acessa uma rota que não existe como arquivo estático (ex: `/gastometro/list`), o servidor retorna 404. O arquivo `404.html` intercepta isso e:

1. Armazena o caminho solicitado em `sessionStorage`
2. Redireciona para o `index.html` na raiz

### 2. Script de Injeção (scripts/inject-spa-routing.js)

Após a build do Expo, um script Node.js injeta um trecho de código no `index.html` que:

1. Recupera o caminho armazenado de `sessionStorage`
2. Restaura o histórico do navegador usando `window.history.replaceState()`
3. Deixa o Expo Router processar a navegação normalmente

**Resultado:** O usuário vê o caminho correto na URL e navega normalmente, mesmo em rotas dinâmicas.

## Configuração de GitHub Pages

Pré-requisito obrigatório antes do primeiro deploy:

1. Acesse `Settings > Pages` do repositório
2. Em **Build and deployment**, selecione **Source: GitHub Actions**
3. Salve a configuração

Sem essa configuração inicial, o passo `actions/deploy-pages` falha com `404 Not Found` ao criar o deployment.

O projeto está configurado para usar GitHub Pages com as seguintes particularidades:

- **Fonte:** Usa workflow automático (Actions)
- **Branch:** Gerenciado pelo workflow em `.github/workflows/deploy-web.yml`
- **Roteamento:** SPA routing com fallback 404.html
- **Base path:** A aplicação é servida em `https://stephhoel.github.io/gastometro/`

## Rotas Web

As rotas são exportadas de forma estática pelo Expo Router. Exemplos:

- `https://stephhoel.github.io/gastometro/` - Tela inicial
- `https://stephhoel.github.io/gastometro/calculator` - Calculadora
- `https://stephhoel.github.io/gastometro/list/add` - Adicionar item

## API de Compartilhamento Web

### WhatsApp

Em web, o botão de compartilhamento abre um link `wa.me/`:

```url
https://wa.me/?text=<mensagem_codificada>
```

Isso abrirá o WhatsApp Web ou será redirecionado automaticamente dependendo do navegador.

### Clipboard

Em web, o copy-paste usa a Clipboard API do navegador (`navigator.clipboard`), que requer HTTPS ou localhost.

## Persistência Web

Os dados são persistidos localmente usando `localStorage` do navegador através da biblioteca `react-native-web` + `AsyncStorage`.

**Dados armazenados:**

- Lista de itens e quantidades
- Preços unitários
- Estado de marcação (coletado/não coletado)

**Nota:** Os dados web são independentes dos dados do Android. Não há sincronização entre plataformas.

## Limitações Conhecidas

1. **APIs Nativas:** Recursos como notificações, sensores, câmera não funcionam em web.
2. **Geolocalização:** Não implementado em web.
3. **Sincronização:** Web e Android mantêm dados separados.
4. **Offline-first:** A versão web requer internet para atualizar componentes da Expo, mas pode funcionar offline após o carregamento inicial.
5. **WhatsApp na web:** O compartilhamento abre `wa.me`/WhatsApp Web; não há deep link nativo equivalente ao Android.
6. **Clipboard e segurança:** `navigator.clipboard` exige ambiente seguro (`https`/`localhost`) e permissões do navegador.
7. **Persistência local web:** Limpeza de dados do navegador pode remover o estado persistido da aplicação.
8. **Fallback SPA:** A restauração de rota profunda depende de `sessionStorage`; com storage desabilitado, o retorno de rota pode falhar.

## Troubleshooting

### Build falha

Se `npm run web:build` falhar:

1. Verifique se há erros de TypeScript: `npm run check:ts`
2. Limpe cache: `npm run clear`
3. Reinstale dependências: `npm install`

### Página em branco após deploy

1. Verifique o console do navegador (DevTools)
2. Verifique se os assets estão sendo carregados corretamente
3. Limpe o cache do navegador (Ctrl+Shift+Del)
4. Verifique se `.nojekyll` existe no `dist/`

### Página em branco no `npm run web`

1. Verifique se não existe `public/index.html` customizado no projeto
2. Rode `npm run web -- --clear` para limpar cache do bundler
3. Reinicie o servidor de desenvolvimento (`npm run web`)

### Dados não são persistidos

1. Verifique as permissões de localStorage do navegador
2. Em incógnito/privado, localStorage é limitado
3. Consulte o console para erros de acesso

## Atualizações Futuras

- [ ] PWA (Progressive Web App) com service worker
- [ ] Sincronização entre web e Android via backend
- [ ] Tema claro/escuro persistente na web
- [ ] Analytics e tracking de uso
