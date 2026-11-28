# Mini-spec: Acessibilidade e usabilidade assistiva

Número: 21
Status: ativa

## Problema

O app possui diversos controles de interação construídos com componentes como TouchableOpacity, Pressable e botões contendo apenas ícones. Nem todos os pontos de interação declaram explicitamente papel, nome acessível, estado ou dica para tecnologias assistivas. Isso pode tornar ações de adicionar, editar, excluir, marcar como coletado e navegar pouco compreensíveis para usuários de leitores de tela.

A experiência também precisa ser avaliada com ampliação de texto, foco e navegação por teclado na web, contraste e tamanho das áreas de toque.

## Objetivo

Estabelecer uma experiência consistente e verificável para leitores de tela e recursos de acessibilidade do Android e dos navegadores, preservando a identidade visual escura do Gastômetro.

## Comportamento esperado

- Todo controle interativo deve expor nome acessível claro e papel semântico adequado.
- Botões somente com ícone devem anunciar a ação e, quando aplicável, o contexto do item/lista.
- Checkboxes de coleta devem anunciar nome do produto e estado marcado/desmarcado.
- Estados selecionados, desabilitados, expandidos e mensagens de validação devem ser comunicados às tecnologias assistivas.
- A ordem de foco deve acompanhar a ordem visual e lógica da tela.
- A navegação web deve permitir uso por teclado, com foco visível.
- Textos devem respeitar configurações de ampliação sem cortes ou sobreposição de ações essenciais.
- Contraste de texto, ícones e estados interativos deve atender ao nível AA aplicável da WCAG.
- Áreas de toque devem ser dimensionadas para interação confortável, especialmente em ações frequentes na lista.
- Alertas e erros devem ser anunciados sem exigir que o usuário descubra visualmente a mensagem.

## Telas e componentes afetados

- Home/lista de compras e itens da lista.
- Gerenciamento de múltiplas listas.
- Contas a pagar.
- Comparação de preços entre lugares e itens.
- Calculadora.
- Formulários de criação e edição de produtos.
- Central de lembretes e telas de lembretes por lista.
- Componentes reutilizáveis em src/components.

## Dados e persistência

- Não exige alteração do modelo persistido.
- Não altera formato de compartilhamento/importação.
- Preferências de acessibilidade devem respeitar as configurações do sistema operacional/navegador; persistência própria só deve ser adicionada se houver decisão explícita.

## Regras de validação

- Não usar apenas cor, posição ou ícone para comunicar estado.
- Evitar rótulos genéricos como “botão” ou “ação” quando o contexto puder ser informado.
- Não duplicar anúncios de leitores de tela em controles compostos.
- Garantir que mensagens de erro e confirmação tenham leitura compreensível.
- Manter suporte a Android como plataforma principal e web estática.

## Critérios de aceite

- Todos os controles interativos principais possuem nome e papel acessíveis.
- Ações icon-only anunciam a ação e o contexto correto.
- Estado de coleta de produtos é anunciado corretamente.
- Fluxos de criar, editar, remover e selecionar listas podem ser concluídos com leitor de tela.
- Fluxos essenciais da web podem ser concluídos por teclado.
- Ampliação de texto não oculta campos, botões ou informações essenciais nas telas cobertas.
- Contraste é verificado com ferramenta apropriada e atende WCAG AA para os elementos aplicáveis.
- Testes automatizados específicos verificam nomes, papéis, dicas, estados e anúncios nos componentes críticos, além dos testes unitários funcionais.
- Auditoria automatizada axe-core cobre WCAG A/AA nas principais telas web.
- Navegação por teclado, foco visível e ampliação de 200% são cobertos pela suíte E2E.
- Uma verificação manual documentada é executada com TalkBack no Android e teclado/leitor de tela em navegador.

## Fora de escopo

- Redesign visual completo.
- Tema claro ou personalização de cores.
- Tradução para novos idiomas.
- Recursos de acessibilidade que dependam de serviço externo.

## Decisões de implementação

- Os componentes reutilizáveis de texto, botões e botões de ícone expõem papéis, rótulos, dicas e estados de acessibilidade.
- Campos de formulário usam rótulos em português, com possibilidade de contextualização quando o nome genérico do campo for insuficiente.
- A calculadora identifica as ações de limpar e calcular e anuncia o resultado atualizado por região viva.
- Ações icon-only informam o contexto do item ou da lista; checkboxes anunciam o nome do produto e seu estado de coleta.
- Os alvos de toque principais usam dimensão mínima de 44 × 44 pontos; botões textuais usam altura mínima de 48 pontos.
- Controles navegáveis por teclado exibem indicador de foco com contorno lime.
- Mensagens de validação e alertas usam regiões vivas; diálogos declaram contexto modal e botões identificáveis.
- A ampliação de texto permanece habilitada pelo comportamento padrão do React Native, sem limitar o fator de escala.
- A verificação de contraste usa a fórmula de luminância relativa da WCAG e pode ser executada por npm run check:a11y:contrast; o workflow Expo Doctor executa essa verificação em pull requests.
- Nenhuma preferência de acessibilidade é persistida pelo app.
- A suíte dedicada tests/accessibility/ valida nomes, papéis, dicas, estados e anúncios em componentes reutilizáveis, itens de lista, calculadora, contas, central de lembretes e comparação de preços, separadamente dos testes unitários funcionais.
- A suíte E2E web usa axe-core para auditar critérios WCAG 2.0/2.1 A e AA nas telas principais, além de cobrir navegação por teclado, foco e ampliação de 200%.
- A verificação manual com TalkBack e leitor de tela permanece obrigatória e pendente até execução documentada em dispositivos e tecnologias assistivas reais.

## Matriz de rastreabilidade da cobertura assistiva

A tabela diferencia os testes dedicados de acessibilidade dos testes funcionais comuns. Os caminhos listados correspondem aos arquivos presentes na suíte dedicada; itens identificados como pendentes serão adicionados nas próximas etapas desta implementação.

| Fluxo/tela | Testes específicos de acessibilidade | Auditoria web axe-core | Teclado/zoom | Validação manual |
|---|---|---|---|---|
| Tela inicial e lista ativa | `critical-flows-accessibility.test.tsx` | Rota inicial e telas principais | Fluxos E2E web | TalkBack e leitor de tela |
| Gerenciamento de listas | A criar: `lists-accessibility.test.tsx` | Rota de listas | Fluxos E2E web | TalkBack e teclado |
| Calculadora | `critical-flows-accessibility.test.tsx` | Rota da calculadora | Fluxos E2E web | TalkBack e teclado |
| Contas | `bills-accessibility.test.tsx` | Rota de contas | Fluxos E2E web | TalkBack e teclado |
| Central de lembretes | `reminders-accessibility.test.tsx` | Rota de lembretes | Fluxos E2E web | TalkBack e teclado |
| Itens de lembrete | `reminder-items-accessibility.test.tsx` | Fluxos de lembretes | Fluxos E2E web | TalkBack e teclado |
| Formulários | A criar: `forms-accessibility.test.tsx` | Formulários abertos, etapa E2E | Fluxos E2E web | TalkBack e teclado |
| Comparação de preços | `price-comparison-accessibility.test.tsx` | Rota de comparação | Fluxos E2E web | TalkBack e teclado |
| Alertas e diálogos | A criar: `alerts-accessibility.test.tsx` | Diálogos abertos, etapa E2E | Foco e retorno, etapa E2E | TalkBack e leitor de tela |
| Componentes reutilizáveis | `critical-flows-accessibility.test.tsx` | Em cada tela consumidora | Em cada tela consumidora | TalkBack e leitor de tela |

A cobertura unitária específica deve verificar nome, papel, dica, estado e comportamento assistivo aplicável. A mera renderização do componente não caracteriza cobertura de acessibilidade.

A auditoria automatizada não substitui a validação manual. Os itens manuais permanecem pendentes até que a execução seja registrada em `docs/ACCESSIBILITY.md` com dispositivo, sistema operacional, versão do TalkBack/leitor de tela, navegador e data.
