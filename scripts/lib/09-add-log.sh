# Adição ao CHANGELOG
echo "$TAB1🔍 Atualizando docs/CHANGELOG.md..."

printf '%s\n' "${TAB2}Descreva as mudanças na nova versão (pressione Enter em uma linha vazia para finalizar):"
changes=""
while true; do
  printf "%s" "$TAB2"  # imprime tabulação
  IFS= read -r line
  [ -z "$line" ] && break
  changes="${changes}${line}\n"
done

timestamp=$(date "+%Y-%m-%d")
tmpfile=$(mktemp)
{
  echo "## $new_version - $timestamp"
  echo ""
  printf '%b' "$changes"
  echo ""
  cat docs/CHANGELOG.md
} > "$tmpfile" && mv "$tmpfile" docs/CHANGELOG.md
echo "$TAB3✔ docs/CHANGELOG.md atualizado com sucesso!"
echo ""
