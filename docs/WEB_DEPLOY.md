# Deploy Web do Gastômetro

Este documento detalha o processo de build, teste e deploy da versão web do Gastômetro no GitHub Pages.

## Build Web Estática

Para gerar uma build web estática compatível com GitHub Pages:

```bash
npm run web:build
```

A build será gerada no diretório `dist/` e será totalmente estática, sem necessidade de backend.

### Estrutura da Build

- `dist/index.html` - HTML principal
- `dist/**/*.js` - JavaScript compilado
- `dist/**/*.css` - Estilos compilados
- `dist/**/*.png` - Imagens otimizadas

## Teste Local

Para testar a build localmente antes de fazer deploy:

```bash
npm run web:build
npm run web:serve
```

Depois abra seu navegador em `http://localhost:3000`.

**Testes recomendados:**

- Tela principal (adicionar, editar, remover items)
- Marcação de itens como coletados
- Calculadora
- Compartilhamento via WhatsApp (abrirá wa.me)
- Importação de lista copiada
- Persistência de dados (recarregue a página)

## Deploy Automático

O deploy automático é executado a cada push na branch `main` via GitHub Actions.

Workflow: `.github/workflows/deploy-web.yml`

**O que o workflow faz:**

1. Faz checkout do código
2. Instala dependências com npm
3. Roda verificação de tipos (TypeScript)
4. Gera build web com `expo export --platform web`
5. Cria arquivo `.nojekyll` para desabilitar Jekyll
6. Faz upload dos artefatos para GitHub Pages
7. Deployment automático ao `gh-pages`

## Configuração de GitHub Pages

O projeto está configurado para usar GitHub Pages com as seguintes particularidades:

- **Fonte:** Usa workflow automático (Actions)
- **Branch:** Gerenciado pelo workflow em `.github/workflows/deploy-web.yml`
- **Roteamento:** Hash-based routing via Expo Router
- **Base path:** A aplicação é servida na raiz do repositório

## Rotas Web

O app usa hash-based routing, então as URLs ficarão assim:

- `https://stephhoel.github.io/gastometro/` - Tela inicial
- `https://stephhoel.github.io/gastometro/#/calculator` - Calculadora
- `https://stephhoel.github.io/gastometro/#/list` - Lista (se implementada)

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

- Lista de items e quantidades
- Preços unitários
- Estado de marcação (coletado/não coletado)

**Nota:** Os dados web são independentes dos dados do Android. Não há sincronização entre plataformas.

## Limitações Conhecidas

1. **APIs Nativas:** Recursos como notificações, sensores, câmera não funcionam em web.
2. **Geolocalização:** Não implementado em web.
3. **Sincronização:** Web e Android mantêm dados separados.
4. **Offline-first:** A versão web requer internet para atualizar componentes da Expo, mas pode funcionar offline após o carregamento inicial.

## Troubleshooting

### Build falha

Se `npm run web:build` falhar:

1. Verifique se há erros de TypeScript: `npm run check`
2. Limpe cache: `npm run clear`
3. Reinstale dependências: `npm install`

### Página em branco após deploy

1. Verifique o console do navegador (DevTools)
2. Verifique os assets estão sendo carregados corretamente
3. Limpe o cache do navegador (Ctrl+Shift+Del)
4. Verifique se `.nojekyll` existe no `dist/`

### Dados não são persistidos

1. Verifique as permissões de localStorage do navegador
2. Em incógnito/privado, localStorage é limitado
3. Consulte o console para erros de acesso

## Atualizações Futuras

- [ ] PWA (Progressive Web App) com service worker
- [ ] Sincronização entre web e Android via backend
- [ ] Tema claro/escuro persistente na web
- [ ] Analytics e tracking de uso
