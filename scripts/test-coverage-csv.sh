#!/bin/sh

set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/docs/coverages"
TIMESTAMP="$(date +"%Y-%m-%d_%H-%M")"
OUTPUT_FILE="$OUTPUT_DIR/${TIMESTAMP}.csv"
TMP_OUTPUT="$(mktemp)"

mkdir -p "$OUTPUT_DIR"

cd "$ROOT_DIR"

echo "Executando testes com cobertura..."
JEST_EXIT_CODE=0
npm run test:coverage 2>&1 | tee "$TMP_OUTPUT" || JEST_EXIT_CODE=$?

echo "File;% Stmts;% Branch;% Funcs;% Lines;Uncovered Line #s" > "$OUTPUT_FILE"

awk -F'|' '
  {
    if (NF < 6) next

    for (i = 1; i <= 6; i++) {
      gsub(/^[ \t]+|[ \t]+$/, "", $i)
      gsub(/;/, ",", $i)
    }

    if ($1 == "" || $1 == "File") next
    if ($2 !~ /^[0-9]+(\.[0-9]+)?$/) next

    print $1 ";" $2 ";" $3 ";" $4 ";" $5 ";" $6
    found = 1
  }
  END {
    if (!found) {
      exit 2
    }
  }
' "$TMP_OUTPUT" >> "$OUTPUT_FILE" || {
  echo "Não foi possível processar a tabela de cobertura da saída do Jest."
  rm -f "$TMP_OUTPUT" "$OUTPUT_FILE"
  exit 1
}

rm -f "$TMP_OUTPUT"

LINE_COVERAGE="$(awk -F';' '$1 == "All files" { print $5; exit }' "$OUTPUT_FILE")" || {
  echo "Falha ao extrair cobertura global de linhas de $OUTPUT_FILE"
  rm -rf coverage
  exit 1
}

if [ -z "$LINE_COVERAGE" ]; then
  echo "Não foi possível encontrar a linha 'All files' no CSV gerado."
  rm -rf coverage
  exit 1
fi

LINE_COVERAGE_ESCAPED="${LINE_COVERAGE}%"
LINE_COVERAGE_BADGE="${LINE_COVERAGE}%25"

node - "$ROOT_DIR" "$LINE_COVERAGE_ESCAPED" "$LINE_COVERAGE_BADGE" <<'NODE'
const fs = require('fs')
const path = require('path')

const rootDir = process.argv[2]
const lineCoverage = process.argv[3]
const lineCoverageBadge = process.argv[4]

const targets = [
  {
    file: 'README.md',
    replacements: [
      {
        pattern: /(https:\/\/img\.shields\.io\/badge\/Coverage-)([0-9]+(?:\.[0-9]+)?%25)(-[^)]+)/,
        replace: (_, prefix, __, suffix) => `${prefix}${lineCoverageBadge}${suffix}`,
      },
    ],
  },
  {
    file: path.join('docs', 'README.md'),
    replacements: [
      {
        pattern: /\| \*\*Cobertura\*\*\s*\|\s*[0-9]+(?:\.[0-9]+)?%\s*\|/,
        replace: (line) => line.replace(/[0-9]+(?:\.[0-9]+)?%/, lineCoverage),
      },
    ],
  },
  {
    file: path.join('docs', 'SPEC.md'),
    replacements: [
      {
        pattern: /(\*\*Cobertura de Testes:\*\*\s*)([0-9]+(?:\.[0-9]+)?%)/,
        replace: (_, prefix) => `${prefix}${lineCoverage}`,
      },
    ],
  },
]

for (const target of targets) {
  const fullPath = path.join(rootDir, target.file)
  let content = fs.readFileSync(fullPath, 'utf8')

  for (const replacement of target.replacements) {
    if (!replacement.pattern.test(content)) {
      throw new Error(`Padrão não encontrado em ${target.file}: ${replacement.pattern}`)
    }
    content = content.replace(replacement.pattern, replacement.replace)
  }

  fs.writeFileSync(fullPath, content, 'utf8')
}
NODE

rm -rf coverage

echo ""
echo "CSV de cobertura gerado em: $OUTPUT_FILE"
echo "Cobertura de linhas atualizada para: $LINE_COVERAGE_ESCAPED"

if [ "$JEST_EXIT_CODE" -ne 0 ]; then
  echo ""
  echo "Aviso: os testes/cobertura retornaram código $JEST_EXIT_CODE."
  exit "$JEST_EXIT_CODE"
fi
