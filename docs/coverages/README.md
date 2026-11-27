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
- Preserve os relatórios anteriores: eles representam medições históricas de versões diferentes do código.

## Última execução automatizada registrada

O workflow `46021328819`, executado em 27/11/2026 no commit `b122f3c43c3326921d6bc4b800cced26435b843e`, aprovou 456 testes em 65 suítes. A cobertura registrada foi de 91,81% em statements, 86,00% em branches, 90,00% em funções e 93,38% em linhas.

Essa medição sucede a execução histórica de 22/11/2026 (workflow `45043861533`, 303 testes em 50 suítes: 96,57% statements, 91,90% branches, 96,21% funções e 97,87% linhas). Os percentuais não devem ser comparados como regressão direta sem considerar a expansão do escopo de testes.

O workflow `46021328819` inclui fixtures não vazias nas seis coleções e aprovou as três execuções E2E após ampliar as asserções de restauração/mesclagem. Também confirmou que o build Android só inicia após o E2E passar. O job de build Android Release iniciou após o E2E, mas foi cancelado durante `assembleRelease`; essa execução não confirmou a geração do APK. A cobertura Jest não é alterada pelo script E2E.
