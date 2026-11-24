# Relatórios de Cobertura

Os arquivos CSV de cobertura são gerados pelo comando:

```bash
npm run test:coverage:csv
```

Formato do nome:

- `YYYY-MM-DD_HH-MM.csv`

Header do CSV:

- `File;% Stmts;% Branch;% Funcs;% Lines;Uncovered Line #s`

Observação:

- Cada execução gera um novo arquivo neste diretório.

## Última execução registrada

Última medição histórica registrada em 22/11/2026: workflow `45043861533`, com 303 testes aprovados em 50 suítes. A cobertura foi de 96,57% em statements, 91,90% em branches, 96,21% em funções e 97,87% em linhas. Essa medição antecede os novos testes de interface e E2E adicionados em 24/11/2026; os indicadores atuais serão atualizados após a conclusão do CI desta alteração.
