#!/bin/sh

set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/docs/coverages"
TIMESTAMP="$(date +"%Y-%m-%d_%H-%M")"
OUTPUT_FILE="$OUTPUT_DIR/${TIMESTAMP}.csv"
TMP_OUTPUT="$(mktemp)"
JEST_EXIT_CODE=0

cleanup() {
  rm -f "$TMP_OUTPUT"
  rm -rf coverage
}

extract_line_coverage() {
  awk -F';' '$1 == "All files" { print $5; exit }' "$OUTPUT_FILE"
}

mkdir -p "$OUTPUT_DIR"

cd "$ROOT_DIR"

echo "Executando testes com cobertura..."
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
  cleanup
  rm -f "$OUTPUT_FILE"
  exit 1
}

LINE_COVERAGE="$(extract_line_coverage)" || {
  echo "Falha ao extrair cobertura global de linhas de $OUTPUT_FILE"
  cleanup
  exit 1
}

if [ -z "$LINE_COVERAGE" ]; then
  echo "Não foi possível encontrar a linha 'All files' no CSV gerado."
  cleanup
  exit 1
fi

if ! node "$ROOT_DIR/scripts/update-coverage-docs.js" "$ROOT_DIR" "$LINE_COVERAGE"; then
  cleanup
  exit 1
fi

LINE_COVERAGE_ESCAPED="${LINE_COVERAGE}%"

cleanup

echo ""
echo "CSV de cobertura gerado em: $OUTPUT_FILE"
echo "Cobertura de linhas atualizada para: $LINE_COVERAGE_ESCAPED"

if [ "$JEST_EXIT_CODE" -ne 0 ]; then
  echo ""
  echo "Aviso: os testes/cobertura retornaram código $JEST_EXIT_CODE."
  exit "$JEST_EXIT_CODE"
fi
