# Mini-spec: Testes E2E para roteamento web SPA

Número: 14
Status: planejado

## Problema

O roteamento web em modo SPA para GitHub Pages pode falhar em cenários de navegação direta, refresh e rotas profundas, e hoje não há suíte E2E cobrindo esse comportamento de ponta a ponta.

## Objetivo

Definir e implementar testes E2E para validar o roteamento web SPA do app em ambiente de execução próximo ao deploy, reduzindo risco de regressões no fluxo de navegação.

## Comportamento esperado

- Acessar a raiz da aplicação deve abrir a tela inicial corretamente.
- Acessar rota profunda diretamente (sem navegação prévia) deve carregar a tela esperada.
- Recarregar a página em rota profunda não deve quebrar a navegação.
- Navegar entre rotas principais deve funcionar com histórico do navegador.
- Navegação para rota inexistente deve seguir o comportamento definido de fallback SPA/404 do projeto.

## Telas afetadas

- Web: rota inicial (`/`).
- Web: rota de calculadora (`/calculator`).
- Web: rota de lista (`/list`).
- Web: fallback de rota inválida (conforme configuração atual de `public/404.html`).

## Dados e persistência

- Os testes não devem alterar formato de persistência existente (`AsyncStorage`/storage web equivalente).
- Quando necessário, usar fixtures estáveis e isolamento de estado entre cenários.
- Não modificar formato de compartilhamento/importação via WhatsApp.

## Regras de validação

- Cada cenário E2E deve ter critério de sucesso objetivo (elemento visível, URL esperada e ausência de erro de carregamento).
- Cenários devem cobrir navegação direta por URL e navegação por interação de UI.
- Cenários não devem depender de ordem de execução.
- Em caso de falha, logs e artefatos devem facilitar diagnóstico (print/video/trace, conforme stack de teste adotada).

## Critérios de aceite

- Suíte E2E executa localmente com comando documentado.
- Existe cobertura mínima para: raiz, rota profunda direta, refresh em rota profunda e fallback de rota inválida.
- Testes passam de forma consistente em pelo menos 3 execuções consecutivas locais.
- Documentação do projeto descreve como rodar os testes E2E e limitações conhecidas.

## Fora de escopo

- Testes E2E nativos Android/iOS.
- Testes de carga/performance web.
- Mudanças de UX fora do necessário para testabilidade.

## Observações para IA

- Preservar compatibilidade com GitHub Pages e o comportamento atual de SPA fallback.
- Evitar dependência de serviços externos durante execução dos testes.
- Priorizar cenários críticos de regressão de roteamento antes de ampliar escopo.
