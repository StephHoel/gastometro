# Mini-spec: Acessibilidade e usabilidade assistiva

Número: 21
Status: planejado

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

## Observações para IA

- Auditar primeiro os componentes reutilizáveis para corrigir vários fluxos em conjunto.
- Usar APIs de acessibilidade do React Native e atributos equivalentes da plataforma web, validando o resultado em runtime.
- Não considerar a presença de `accessibilityLabel` isoladamente como prova de acessibilidade; validar a experiência real.
