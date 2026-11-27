# Acessibilidade

## Comportamentos implementados

- Botões de ícone possuem papel de botão, nome acessível contextual e alvo de toque mínimo de 44 × 44 pontos.
- A coleta de produtos é anunciada como checkbox, com nome dinâmico e estado marcado/desmarcado.
- Campos reutilizáveis recebem rótulo e dica em português; telas podem substituir nomes genéricos por descrições contextuais.
- Mensagens de erro e alertas expõem semântica e anúncios para tecnologias assistivas.
- Controles de listas, lembretes, contas e comparação possuem rótulos contextuais e estados acessíveis.
- A calculadora identifica campos e ações e anuncia o resultado atualizado.
- Botões reutilizáveis têm papel semântico e foco visível na web.
- A ampliação de texto permanece habilitada pelas configurações padrão do React Native.

## Testes automatizados

A suíte dedicada de acessibilidade pode ser executada separadamente:

```bash
npm run test:a11y
```

Ela verifica nomes, papéis, dicas, estados e anúncios nos componentes reutilizáveis, item de lista e calculadora. Os testes unitários funcionais continuam sendo executados pelo comando `npm test`.

A auditoria web com axe-core está integrada à suíte Playwright:

```bash
npm run test:e2e:web
```

A auditoria executa as regras WCAG 2.0 e 2.1 dos níveis A e AA nas telas iniciais, listas, calculadora e comparação de preços. Os cenários E2E também verificam rotas, navegação, foco por teclado e disponibilidade dos controles com zoom de 200% nas telas principais.

A auditoria automatizada é complementar: não comprova sozinha a experiência real com leitor de tela e pode não detectar problemas de ordem de leitura, clareza contextual ou anúncios excessivos.

## Verificação de contraste

Execute:

```bash
npm run check:a11y:contrast
```

O script calcula a razão de contraste pela fórmula de luminância relativa da WCAG.

| Tipo de conteúdo | Critério mínimo |
| --- | ---: |
| Texto normal | 4,5:1 |
| Texto grande (a partir de 24 px ou 18,66 px em negrito) | 3:1 |
| Componentes gráficos, ícones informativos e indicador de foco | 3:1 |

O script valida apenas combinações explicitamente cadastradas. Ele não inspeciona automaticamente estilos arbitrários, cores dinâmicas, opacidade, imagens ou todos os estados de todas as telas. A auditoria axe pode complementar a identificação de problemas de contraste no DOM web.

## Validação manual obrigatória

A conclusão da mini-spec depende da execução e do registro desta validação. Os itens abaixo permanecem pendentes até que sejam testados em dispositivos e tecnologias assistivas reais.

### Android com TalkBack

- [ ] Percorrer a tela inicial, ouvir os totais e navegar entre adicionar, remover, editar e coletar produtos.
- [ ] Confirmar que o checkbox anuncia o nome do produto e seu estado.
- [ ] Conferir os rótulos e estados de pagamento das contas.
- [ ] Navegar pela calculadora e pela comparação de preços, incluindo ordenação, edição e remoção.
- [ ] Criar, selecionar, renomear e remover listas.
- [ ] Criar, editar, remover e abrir lembretes.
- [ ] Confirmar que alertas anunciam título, mensagem e ações sem repetição indevida.

### Web com teclado e leitor de tela

- [ ] Percorrer os controles com Tab e Shift+Tab, sem saltos inesperados.
- [ ] Confirmar foco visível em todos os botões e campos.
- [ ] Executar os fluxos essenciais sem mouse, incluindo listas, calculadora, contas, lembretes e comparação de preços.
- [ ] Confirmar que mensagens de erro e estados selecionados são anunciados.

### Ampliação

- [ ] Testar ampliação de texto do sistema/navegador e zoom do navegador em 200%.
- [ ] Confirmar que campos, rótulos, botões e informações essenciais continuam disponíveis, sem cortes ou sobreposição nas telas de listas, calculadora, contas, lembretes e comparação.

Data da verificação manual: pendente.
