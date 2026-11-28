# Mini-spec: Web compatível com GitHub Pages

Número: 08
Status: implementado

## Problema

O foco atual é Android, mas o projeto deve ter uma versão web compatível com GitHub Pages.

## Objetivo

Permitir publicar uma build web estática do app no GitHub Pages sem quebrar o comportamento Android.

## Comportamento esperado

- O app deve rodar no navegador com fluxo principal funcional.
- A build web deve gerar artefatos estáticos compatíveis com GitHub Pages.
- Rotas do Expo Router devem funcionar em deploy estático.
- Recursos nativos indisponíveis na web devem ter fallback seguro.
- Compartilhamento via WhatsApp deve continuar funcionando quando possível por URL.

## Telas afetadas

- Todas as telas principais.
- Fluxo de compartilhamento/importação.
- Configuração Expo/web.
- Workflows GitHub Actions, pois a publicação será automatizada.

## Dados e persistência

- Persistência web deve ser validada com AsyncStorage/react-native-web.
- Se o comportamento divergir por plataforma, documentar claramente.
- Não quebrar dados Android.

## Regras de validação

- Build web deve passar sem erros.
- A navegação deve funcionar em URL base do GitHub Pages.
- A execução local com `npm run web` não pode apresentar tela em branco.
- Não introduzir `public/index.html` customizado para evitar quebra da injeção de scripts do Expo no ambiente web local.
- APIs nativas sem suporte web devem ter fallback.
- Tema escuro deve ser preservado.

## Critérios de aceite

- Gerar build web estática.
- Abrir app localmente a partir da build web.
- Validar tela principal, adicionar item, editar item, remover item e calculadora na web.
- Documentar comando de build/deploy.
- Preservar funcionamento Android.

## Fora de escopo

- PWA completo.
- Sincronização entre web e Android.
- Login/backend.

## Observações para IA

- Estratégia definida: usar build estática com `expo export --platform web` no Expo 56.
- Manter template HTML padrão do Expo para compatibilidade entre `npm run web` e build estática.

## Registro de implementação

- 2026-06-13: build web estática e deploy no GitHub Pages habilitados.
- 2026-06-13: fallback de roteamento SPA implementado com `public/404.html` e `scripts/inject-spa-routing.js`.
- 2026-06-13: documentação principal atualizada em `README.md`, `docs/WEB_DEPLOY.md` e `docs/SPEC.md`.
