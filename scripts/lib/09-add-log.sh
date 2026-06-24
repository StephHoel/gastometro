# Adição ao CHANGELOG
echo "$TAB1🔍 Atualizando docs/CHANGELOG.md..."

# Remove espaços nas pontas para evitar entradas vazias como " "
trimmed_changelog=$(printf '%s' "$CHANGELOG_ARG" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

if [ -n "$trimmed_changelog" ]; then
  changes="$trimmed_changelog"
  echo "${TAB2}Changelog recebido via argumento."
else
  printf '%s\n' "${TAB2}Descreva as mudanças na nova versão (pressione Enter em uma linha vazia para finalizar):"
  changes=""
  while true; do
    printf "%s" "$TAB2"
    IFS= read -r line
    [ -z "$line" ] && break
    changes="${changes}${line}
"
  done
fi

timestamp=$(date "+%Y-%m-%d")
version_header="## $new_version - $timestamp"

# Verifica se a versão já existe no changelog
if grep -q "^## $new_version" docs/CHANGELOG.md; then
  echo "${TAB2}Versão $new_version já existe no changelog."
  
  if [ -n "$changes" ]; then
    # Encontra a primeira linha em branco após o cabeçalho de versão e insere as mudanças
    tmpfile=$(mktemp)
    awk -v version="$new_version" -v newchanges="$changes" '
      BEGIN { found = 0; inserted = 0 }
      /^## '"$version"'/ { found = 1; print; next }
      found && !inserted && /^$/ {
        print ""
        print newchanges
        print ""
        inserted = 1
        next
      }
      { print }
    ' docs/CHANGELOG.md > "$tmpfile" && mv "$tmpfile" docs/CHANGELOG.md
    echo "${TAB3}✔ Conteúdo adicionado na seção de versão $new_version"
  else
    echo "${TAB3}ℹ Nenhuma mensagem a adicionar. Seção de versão preservada."
  fi
else
  # Cria novo bloco de versão no topo
  tmpfile=$(mktemp)
  {
    echo "$version_header"
    echo ""
    if [ -n "$changes" ]; then
      printf '%s\n' "$changes"
      echo ""
    fi
    cat docs/CHANGELOG.md
  } > "$tmpfile" && mv "$tmpfile" docs/CHANGELOG.md
  echo "${TAB3}✔ Nova seção de versão $new_version criada no topo"
fi

echo ""
