#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/docs/coverages"
TIMESTAMP="$(date +"%Y-%m-%d_%H-%M")"
OUTPUT_FILE="$OUTPUT_DIR/${TIMESTAMP}.csv"
TMP_OUTPUT="$(mktemp)"

mkdir -p "$OUTPUT_DIR"

cd "$ROOT_DIR"

echo "Executando testes com cobertura..."
if ! npm run test:coverage 2>&1 | tee "$TMP_OUTPUT"; then
  echo "Falha ao executar cobertura. O CSV nao foi gerado."
  rm -f "$TMP_OUTPUT"
  exit 1
fi

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
  echo "Nao foi possivel processar a tabela de cobertura da saida do Jest."
  rm -f "$TMP_OUTPUT" "$OUTPUT_FILE"
  exit 1
}

rm -f "$TMP_OUTPUT"

rm -rf coverage

echo "CSV de cobertura gerado em: $OUTPUT_FILE"
