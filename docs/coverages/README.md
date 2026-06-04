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
