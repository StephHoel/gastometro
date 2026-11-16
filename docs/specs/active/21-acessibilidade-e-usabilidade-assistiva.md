# Mini-spec: Acessibilidade e usabilidade assistiva

Número: 21
Status: ativa

## Problema

O app possui diversos controles de interação construídos com componentes como `TouchableOpacity`, `Pressable` e botões contendo apenas ícones. Nem todos os pontos de interação declaram explicitamente papel, nome acessível, estado ou dica para tecnologias assistivas. Isso pode tornar ações de adicionar, editar, excluir, marcar como coletado e navegar pouco compreensíveis para usuários de leitores de tela.

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
- Calculadora.
- Formulários de criação e edição de produtos.
- Central de lembretes e telas de lembretes por lista.
- Componentes reutilizáveis em `src/components`.

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
- Testes automatizados verificam propriedades de acessibilidade nos componentes críticos.
- Uma verificação manual documentada é executada com TalkBack no Android e teclado/leitor de tela em navegador.

## Fora de escopo

- Redesign visual completo.
- Tema claro ou personalização de cores.
- Tradução para novos idiomas.
- Recursos de acessibilidade que dependam de serviço externo.

## Decisões de implementação

- Os componentes reutilizáveis de texto, botões e botões de ícone expõem papéis, rótulos, dicas e estados de acessibilidade.
- Ações icon-only informam o contexto do item ou da lista; checkboxes anunciam o nome do produto e seu estado de coleta.
- Os alvos de toque principais usam dimensão mínima de 44 × 44 pontos; botões textuais usam altura mínima de 48 pontos.
- Controles navegáveis por teclado exibem indicador de foco com contorno lime.
- Mensagens de validação e alertas usam regiões vivas; diálogos declaram contexto modal e botões identificáveis.
- A ampliação de texto permanece habilitada pelo comportamento padrão do React Native, sem limitar o fator de escala.
- A verificação de contraste usa a fórmula de luminância relativa da WCAG e pode ser executada por `npm run check:a11y:contrast`; o workflow Expo Doctor executa essa verificação em pull requests.
- Nenhuma preferência de acessibilidade é persistida pelo app.
- A verificação manual com TalkBack e leitor de tela/navegação por teclado em navegador permanece pendente e deve ser concluída durante a validação do PR.
