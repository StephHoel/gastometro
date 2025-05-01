# Verificação ou criação do CHANGELOG
echo "$TAB1🔍 Verificando CHANGELOG.md..."
if [ ! -f CHANGELOG.md ]; then
  echo "# Changelog" > CHANGELOG.md
  echo "" >> CHANGELOG.md
fi
echo "$TAB2✔ CHANGELOG.md encontrado."
echo ""