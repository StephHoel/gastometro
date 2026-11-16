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

O script calcula a razão de contraste pela fórmula de luminância relativa da WCAG e verifica as combinações de cores usadas nos componentes principais. O critério adotado para texto normal é 4,5:1 (WCAG AA).

| Combinação verificada | Razão |
| --- | ---: |
| Texto principal na tela | 17,85:1 |
| Texto secundário na tela | 6,96:1 |
| Texto em lista selecionada | 7,58:1 |
| Placeholder em campo | 6,97:1 |
| Texto secundário em cartão | 9,85:1 |
| Ação lime no fundo | 11,84:1 |
| Texto preto em botão lime | 13,93:1 |
| Texto branco em botão de cancelar | 4,83:1 |
| Texto preto em botão neutro | 8,19:1 |
| Texto branco em botão secundário | 4,76:1 |
| Texto de erro em cartão | 5,29:1 |
| Texto secundário em lista selecionada | 5,10:1 |

Esses resultados cobrem as combinações explicitamente listadas no script, não substituem a auditoria de todos os estados visuais nem a validação em dispositivos reais.

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
