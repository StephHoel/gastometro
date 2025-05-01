# Adição ao CHANGELOG
echo "$TAB1🔍 Atualizando CHANGELOG.md..."

echo -e "${TAB2}Descreva as mudanças na nova versão (pressione Enter em uma linha vazia para finalizar):"
changes=""
while true; do
  echo -n "$TAB2"  # imprime tabulação
  IFS= read -r line
  [ -z "$line" ] && break
  changes+="$line"$'\n'
done

timestamp=$(date "+%Y-%m-%d")
tmpfile=$(mktemp)
{
  echo "## $new_version - $timestamp"
  echo ""
  echo "$changes"
  echo ""
  cat CHANGELOG.md
} > "$tmpfile" && mv "$tmpfile" CHANGELOG.md
echo "$TAB3✔ CHANGELOG.md atualizado com sucesso!"
echo ""
