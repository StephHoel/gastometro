# Pull Request

## Tipo de alteração

<!-- Marque apenas o tipo principal -->

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `chore` — versão, dependências ou automação
- [ ] `refactor` — refatoração sem mudança de comportamento
- [ ] `docs` — documentação
- [ ] `test` — adição ou ajuste de testes

## Descrição

<!-- O que foi feito e por quê? Seja objetivo. -->

## Mini-spec relacionada

<!-- Se for feature: link para o arquivo em docs/specs/ ou "não se aplica" -->

## Arquivos alterados

<!-- Liste os arquivos principais modificados e o motivo resumido -->

## Verificações executadas

- [ ] `npm run test` passou (cobertura ≥ 80%)
- [ ] `npm run check:ts` passou (TypeScript sem erros de tipo)
- [ ] Sem uso de `any`
- [ ] Biome (`npm run check:biome`) sem erros bloqueantes — quando aplicável

## Checklist de qualidade

- [ ] Testes criados ou atualizados proporcionalmente ao escopo
- [ ] Todo hook com tratamento de erro
- [ ] Imports internos usando alias `@/`
- [ ] Textos do usuário em pt-BR preservados
- [ ] Regras de moeda/números BRL e vírgula/ponto preservadas
- [ ] Formato de persistência (`gastometro` no AsyncStorage) não alterado sem plano de migração
- [ ] Formato de compartilhamento WhatsApp preservado (retrocompatibilidade)
- [ ] Documentação atualizada (`docs/CHANGELOG.md`, `docs/SPEC.md`, `README.md` se aplicável)

## Versionamento

<!-- Marque se este PR altera src/ e/ou tests/ -->

- [ ] `package.json` e `app.config.js` atualizados com nova versão
- [ ] `android/app/build.gradle` atualizado (`versionName`) — se existir e aplicável
- [ ] Entrada adicionada no topo de `docs/CHANGELOG.md`
- [ ] Não se aplica (PR não altera código ou testes)

## Riscos e pendências

<!-- Há breaking changes, mudança de comportamento, impacto em dados persistidos ou compatibilidade? -->
<!-- Se sim, descreva e indique o que ainda precisa de confirmação humana. -->
