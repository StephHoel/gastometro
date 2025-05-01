#!/bin/bash

# Função para incrementar versão
increment_version() {
  local version=$1
  local part=$2
  IFS='.' read -r major minor patch <<< "$version"

  case $part in
    major) major=$((major + 1)); minor=0; patch=0 ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    patch) patch=$((patch + 1)) ;;
  esac

  echo "$major.$minor.$patch"
}

# Obter versão atual do package.json
current_version=$(grep '"version":' package.json | head -n 1 | sed -E 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/')

echo "Versão atual: $current_version"
echo ""
echo "Escolha o tipo de atualização:"
echo "1) Patch (ex: $current_version -> $(increment_version $current_version patch))"
echo "2) Minor (ex: $current_version -> $(increment_version $current_version minor))"
echo "3) Major (ex: $current_version -> $(increment_version $current_version major))"
echo "4) Especificar versão manualmente"
read -p "Opção: " option

case $option in
  1) new_version=$(increment_version $current_version patch) ;;
  2) new_version=$(increment_version $current_version minor) ;;
  3) new_version=$(increment_version $current_version major) ;;
  4) read -p "Digite a nova versão (ex: 2.1.0): " new_version ;;
  *) echo "Opção inválida"; exit 1 ;;
esac

echo "Nova versão: $new_version"

# Criar nova branch release/vX.Y.Z a partir de 'release'
git checkout release || { echo "Branch 'release' não encontrada."; exit 1; }
git pull origin release
git checkout -b "release/v$new_version"

# Atualizar versões nos arquivos
sed -i.bak -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$new_version\"/" package.json
sed -i.bak -E "s/versionName \"[0-9]+\.[0-9]+\.[0-9]+\"/versionName \"$new_version\"/" android/app/build.gradle
sed -i.bak -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$new_version\"/" app.json

# Changelog
read -p "Descrição das mudanças: " changes
timestamp=$(date "+%Y-%m-%d")

tmpfile=$(mktemp)
{
  echo "## $new_version - $timestamp"
  echo "$changes"
  echo ""
  cat CHANGELOG.md
} > "$tmpfile" && mv "$tmpfile" CHANGELOG.md

# Limpar arquivos temporários
rm -f *.bak

# Git commit e tag
git add package.json app.json android/app/build.gradle CHANGELOG.md
git commit -m "chore: versão $new_version – $changes"
# git tag -a "v$new_version" -m "Versão $new_version: $changes"

echo "✔ Versão $new_version aplicada com sucesso."
echo "✔ Branch release/v$new_version criada."
# echo "✔ Commit e tag anotada gerados."
echo "✔ Commit gerado."

# Dica final
echo ""
echo "➡ Agora você pode rodar:"
# echo "   git push origin release/v$new_version && git push origin --tags"
echo "   git push origin release/v$new_version"