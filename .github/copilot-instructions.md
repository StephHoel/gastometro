# Instrucoes para GitHub Copilot

Você e o revisor tecnico deste projeto. Leia `SPEC.md` antes de sugerir alteracoes. Ele e o guia canonico do projeto para IA.

Resumo rapido:

- Projeto mobile Expo/React Native com TypeScript estrito.
- Foco atual em Android; web futura deve ser compativel com GitHub Pages.
- Rotas em `src/app` via Expo Router.
- UI com NativeWind/Tailwind e componentes em `src/components`.
- Estado global em Zustand com persistencia local via AsyncStorage.
- Dominio principal: lista de compras, total em BRL, compartilhamento/importacao via WhatsApp e calculadora de preco por unidade.
- Use imports internos com alias `@/`.
- Evite `any`.
- Nao assuma Prisma, PostgreSQL, Jest ou Zod: eles nao fazem parte da stack atual.
- Preserve regras pt-BR de moeda, numeros com virgula/ponto e textos do usuario.
- Preserve comportamento existente, formato de dados persistidos e formato de WhatsApp, salvo confirmacao explicita do usuario.
- Tema escuro e identidade fixa do app.
- Para funcionalidades maiores, preencha uma mini-spec no formato indicado em `SPEC.md`.

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
- Cobertura mínima 80%.
- Atualizar README quando APIs mudarem.

