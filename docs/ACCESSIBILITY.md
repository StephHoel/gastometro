# Acessibilidade

## Comportamentos implementados

- Botões de ícone possuem papel de botão, nome acessível contextual e alvo de toque mínimo de 44 × 44 pontos.
- A coleta de produtos é anunciada como checkbox, com nome dinâmico e estado marcado/desmarcado.
- Campos reutilizáveis recebem rótulo e dica a partir do nome e da finalidade do campo.
- Mensagens de erro e alertas são expostos como regiões vivas; diálogos identificam o contexto modal.
- Botões reutilizáveis têm papel semântico e foco visível na web.
- Controles de listas, lembretes e comparação têm rótulos específicos, estados selecionados e alvos de toque ampliados.
- A ampliação de texto permanece habilitada pelas configurações padrão do React Native.

## Verificação de contraste

Execute:

```bash
npm run check:a11y:contrast
```

O script calcula a razão de contraste pela fórmula de luminância relativa da WCAG. A verificação está dividida por tipo de conteúdo:

| Tipo de conteúdo | Critério mínimo |
| --- | ---: |
| Texto normal | 4,5:1 |
| Texto grande (a partir de 24 px ou 18,66 px em negrito) | 3:1 |
| Componentes gráficos, ícones informativos e indicador de foco | 3:1 |

As combinações verificadas incluem texto principal e secundário, placeholders, cartões, listas selecionadas, botões de sucesso/neutro/cancelamento, texto de erro, contorno de foco e ícones sobre os fundos escuros usados pela interface.

O script valida apenas as combinações explicitamente cadastradas. Ele não inspeciona automaticamente estilos arbitrários, cores dinâmicas, opacidade, imagens ou todos os estados de todas as telas. Novas combinações visuais devem ser adicionadas ao conjunto de verificações quando forem introduzidas.

## Verificação manual pendente

A validação automatizada não substitui o teste com tecnologia assistiva. Antes de considerar a mini-spec concluída, validar:

### Android com TalkBack

- [ ] Percorrer a tela inicial, ouvir os totais e navegar entre adicionar, remover, editar e coletar produtos.
- [ ] Confirmar que o checkbox anuncia o nome do produto e seu estado.
- [ ] Criar, selecionar, renomear e remover listas.
- [ ] Criar, editar, remover e abrir lembretes.
- [ ] Confirmar que alertas anunciam título, mensagem e ações sem repetição indevida.

### Web com teclado e leitor de tela

- [ ] Percorrer os controles com Tab e Shift+Tab, sem saltos inesperados.
- [ ] Confirmar foco visível em todos os botões e campos.
- [ ] Executar os fluxos essenciais sem mouse.
- [ ] Confirmar que mensagens de erro e estados selecionados são anunciados.

### Ampliação

- [ ] Testar ampliação de texto do sistema/navegador e zoom do navegador em 200%.
- [ ] Confirmar que campos, rótulos, botões e informações essenciais continuam disponíveis, sem cortes ou sobreposição.

Data da verificação manual: pendente.
