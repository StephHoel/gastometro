#!/bin/sh

set -eu

TAB1="    "
TAB2="${TAB1}${TAB1}"

base_ref="${1:-${BASE_SHA:-origin/main}}"
head_ref="${2:-${HEAD_SHA:-HEAD}}"

fail() {
  echo "${TAB2}ERRO: $1"
  exit 1
}

get_version_from_ref() {
  ref="$1"
  file="$2"

  raw="$(git show "${ref}:${file}" 2>/dev/null || true)"
  if [ -z "$raw" ]; then
    echo ""
    return
  fi

  one_line="$(printf '%s' "$raw" | tr -d '\r\n')"

  if [ "$file" = "app.json" ]; then
    expo_version="$(printf '%s' "$one_line" | sed -nE 's/.*"expo"[[:space:]]*:[[:space:]]*\{[^}]*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p')"
    if [ -n "$expo_version" ]; then
      echo "$expo_version"
      return
    fi
  fi

  version="$(printf '%s' "$one_line" | sed -nE 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p')"
  echo "$version"
}

echo "Verificando repositório Git..."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Este script precisa ser executado dentro de um repositório Git."
echo "${TAB2}OK: Repositório Git encontrado."

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "$repo_root" ] || fail "Não foi possível identificar a raiz do repositório."

cd "$repo_root"
echo "${TAB2}OK: Executando na raiz do repositório: $repo_root"
echo ""

echo "${TAB1}Verificando arquivos essenciais..."
for file in package.json app.json; do
  [ -f "$file" ] || fail "Arquivo obrigatório não encontrado: $file"
done
echo "${TAB2}OK: Todos os arquivos obrigatórios encontrados."

if [ -f "android/app/build.gradle" ]; then
  echo "${TAB2}OK: Arquivo opcional encontrado: android/app/build.gradle"
else
  echo "${TAB2}INFO: Arquivo opcional ausente: android/app/build.gradle"
fi
echo ""

echo "${TAB1}Validando refs de comparação..."
echo "${TAB2}Base ref: $base_ref"
echo "${TAB2}Head ref: $head_ref"

git rev-parse --verify "$base_ref" >/dev/null 2>&1 || fail "Base ref inválida ou ausente: $base_ref. Dica: rode 'git fetch origin main' e tente novamente."
git rev-parse --verify "$head_ref" >/dev/null 2>&1 || fail "Head ref inválida ou ausente: $head_ref"

echo "${TAB2}OK: Refs válidas."
echo ""

echo "${TAB1}Verificando arquivos alterados no intervalo..."
changed_files="$(git diff --name-only "$base_ref" "$head_ref" 2>/dev/null || true)"
[ -n "$changed_files" ] || {
  echo "${TAB2}OK: Sem arquivos alterados no intervalo informado. Check aprovado."
  exit 0
}

if ! printf '%s\n' "$changed_files" | grep -Eq '^(src/|tests/)'; then
  echo "${TAB2}OK: Sem alterações em src/ ou tests/."
  echo "${TAB2}OK: Check aprovado sem exigir bump de versão."
  exit 0
fi

echo "${TAB2}INFO: Alterações detectadas em src/ ou tests/."
echo "${TAB2}INFO: Bump de versão exigido."
echo ""

base_package_version="$(get_version_from_ref "$base_ref" package.json)"
head_package_version="$(get_version_from_ref "$head_ref" package.json)"
base_app_version="$(get_version_from_ref "$base_ref" app.json)"
head_app_version="$(get_version_from_ref "$head_ref" app.json)"

echo "${TAB1}Comparando versões..."
echo "${TAB2}Versão base package.json: $base_package_version"
echo "${TAB2}Versão head package.json: $head_package_version"
echo "${TAB2}Versão base app.json: $base_app_version"
echo "${TAB2}Versão head app.json: $head_app_version"

[ -n "$head_package_version" ] || fail "Não foi possivel ler versão em package.json e/ou app.json do head."
[ -n "$head_app_version" ] || fail "Não foi possivel ler versão em package.json e/ou app.json do head."

[ "$head_package_version" = "$head_app_version" ] || fail "Versões divergentes entre package.json ($head_package_version) e app.json ($head_app_version)."

if [ "$base_package_version" = "$head_package_version" ] && [ "$base_app_version" = "$head_app_version" ]; then
  fail "Houve alteração em src/ ou tests/, mas sem bump de versão. Atualize package.json e app.json (campo version) antes do merge."
fi

echo "${TAB2}OK: Bump de versão detectado e consistente. Check aprovado."
