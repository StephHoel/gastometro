# Mini-spec: Web compativel com GitHub Pages

Status: planejado

## Problema

O foco atual e Android, mas o projeto deve ter uma versao web compativel com GitHub Pages.

## Objetivo

Permitir publicar uma build web estatica do app no GitHub Pages sem quebrar o comportamento Android.

## Comportamento esperado

- O app deve rodar no navegador com fluxo principal funcional.
- A build web deve gerar artefatos estaticos compativeis com GitHub Pages.
- Rotas do Expo Router devem funcionar em deploy estatico.
- Recursos nativos indisponiveis na web devem ter fallback seguro.
- Compartilhamento via WhatsApp deve continuar funcionando quando possivel por URL.

## Telas afetadas

- Todas as telas principais.
- Fluxo de compartilhamento/importacao.
- Configuracao Expo/web.
- Workflows GitHub Actions, pois a publicacao sera automatizada.

## Dados e persistencia

- Persistencia web deve ser validada com AsyncStorage/react-native-web.
- Se o comportamento divergir por plataforma, documentar claramente.
- Nao quebrar dados Android.

## Regras de validacao

- Build web deve passar sem erros.
- A navegacao deve funcionar em URL base do GitHub Pages.
- APIs nativas sem suporte web devem ter fallback.
- Tema escuro deve ser preservado.

## Criterios de aceite

- Gerar build web estatica.
- Abrir app localmente a partir da build web.
- Validar tela principal, adicionar item, editar item, remover item e calculadora na web.
- Documentar comando de build/deploy.
- Preservar funcionamento Android.

## Fora de escopo

- PWA completo.
- Sincronizacao entre web e Android.
- Login/backend.

## Observacoes para IA

- Confirmar estrategia de base path do GitHub Pages antes de implementar.
- Verificar se `expo export --platform web` ou fluxo equivalente e o caminho correto para Expo 56.
