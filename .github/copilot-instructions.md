# Instruções para GitHub Copilot

Você é o revisor técnico deste projeto. Leia `docs/SPEC.md` antes de sugerir alterações. Ele é o guia canônico do projeto para IA.

Resumo rápido:

- Projeto mobile Expo/React Native com TypeScript estrito.
- Foco atual em Android; web futura deve ser compatível com GitHub Pages.
- Rotas em `src/app` via Expo Router.
- UI com NativeWind/Tailwind e componentes em `src/components`.
- Estado global em Zustand com persistência local via AsyncStorage.
- Domínio principal: lista de compras, total em BRL, compartilhamento/importação via WhatsApp e calculadora de preço por unidade.
- Use imports internos com alias `@/`.
- Evite `any`.
- Não assuma Prisma, PostgreSQL, Jest ou Zod: eles não fazem parte da stack atual.
- Preserve regras pt-BR de moeda, números com vírgula/ponto e textos do usuário.
- Preserve comportamento existente, formato de dados persistidos e formato de WhatsApp, salvo confirmação explícita do usuário.
- Tema escuro e identidade fixa do app.
- Para funcionalidades maiores, preencha uma mini-spec no formato indicado em `docs/SPEC.md`.

Responsabilidades:

- Detectar bugs.
- Detectar problemas de performance.
- Sugerir refatorações.
- Gerar testes para novas funcionalidades.
- Atualizar documentação.

Regras:

- Nunca utilizar any.
- Todo hook deve possuir tratamento de erro.
- Componentes complexos precisam de testes.
- Cobertura: quando a suíte de testes existir, manter/expandir cobertura proporcional ao escopo.
- Atualizar README quando APIs mudarem.

