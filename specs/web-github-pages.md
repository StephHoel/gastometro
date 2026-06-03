# Mini-spec: Web compatível com GitHub Pages

Status: planejado

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

- Confirmar estratégia de base path do GitHub Pages antes de implementar.
- Verificar se `expo export --platform web` ou fluxo equivalente é o caminho correto para Expo 56.
