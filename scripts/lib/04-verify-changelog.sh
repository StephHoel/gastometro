# Verificação ou criação do CHANGELOG
echo "$TAB1🔍 Verificando docs/CHANGELOG.md..."
if [ ! -f docs/CHANGELOG.md ]; then
  mkdir -p docs
  echo "# Changelog" > docs/CHANGELOG.md
  echo "" >> docs/CHANGELOG.md
fi
echo "$TAB2✔ docs/CHANGELOG.md encontrado."
echo ""