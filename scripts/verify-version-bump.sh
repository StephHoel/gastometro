#!/bin/sh

set -eu

TAB1="    "
TAB2="${TAB1}${TAB1}"

base_ref="${1:-${BASE_SHA:-origin/main}}"
head_ref="${2:-${HEAD_SHA:-HEAD}}"
VERBOSE="${VERBOSE:-0}"
AUTO_FETCH="${AUTO_FETCH:-0}"

is_enabled() {
  case "${1:-0}" in
    1|true|TRUE|yes|YES|on|ON)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

debug() {
  if is_enabled "$VERBOSE"; then
    echo "${TAB2}DEBUG: $1"
  fi
}

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

  raw_clean="$(printf '%s\n' "$raw" | tr -d '\r')"

  if [ "$file" = "package.json" ]; then
    one_line="$(printf '%s' "$raw_clean" | tr -d '\n')"
    version="$(printf '%s' "$one_line" | sed -nE 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p')"
    echo "$version"
    return
  fi

  if [ "$file" = "app.config.js" ]; then
    expo_version="$(printf '%s\n' "$raw_clean" | sed -nE 's/^[[:space:]]*["'"'"']?version["'"'"']?[[:space:]]*:[[:space:]]*["'"'"']([^"'"'"']+)["'"'"'][[:space:]]*,?[[:space:]]*$/\1/p' | head -n 1)"
    if [ -n "$expo_version" ]; then
      echo "$expo_version"
      return
    fi

    one_line="$(printf '%s' "$raw_clean" | tr -d '\n')"
    expo_version="$(printf '%s' "$one_line" | sed -nE 's/.*[,{[:space:]]["'"'"']?version["'"'"']?[[:space:]]*:[[:space:]]*["'"'"']([^"'"'"']+)["'"'"'].*/\1/p')"
    echo "$expo_version"
    return
  fi

  echo ""
}

get_gradle_version_from_ref() {
  ref="$1"
  file="$2"

  raw="$(git show "${ref}:${file}" 2>/dev/null || true)"
  if [ -z "$raw" ]; then
    echo ""
    return
  fi

  raw_clean="$(printf '%s\n' "$raw" | tr -d '\r')"

  gradle_version="$(printf '%s\n' "$raw_clean" | sed -nE 's/^[[:space:]]*versionName[[:space:]]*(=)?[[:space:]]*["'"'"']([^"'"'"']+)["'"'"'][[:space:]]*$/\2/p' | head -n 1)"
  if [ -n "$gradle_version" ]; then
    echo "$gradle_version"
    return
  fi

  one_line="$(printf '%s' "$raw_clean" | tr -d '\n')"
  gradle_version="$(printf '%s' "$one_line" | sed -nE 's/.*versionName[[:space:]]*(=)?[[:space:]]*["'"'"']([^"'"'"']+)["'"'"'].*/\2/p')"
  echo "$gradle_version"
}

file_exists_in_ref() {
  ref="$1"
  file="$2"
  git cat-file -e "${ref}:${file}" >/dev/null 2>&1
}

echo "Verificando repositório Git..."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Este script precisa ser executado dentro de um repositório Git."
echo "${TAB2}OK: Repositório Git encontrado."

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "$repo_root" ] || fail "Não foi possível identificar a raiz do repositório."

cd "$repo_root"
echo "${TAB2}OK: Executando na raiz do repositório: $repo_root"
echo ""
debug "Modo verboso ativo."
debug "Ref base recebida: $base_ref"
debug "Ref head recebida: $head_ref"

echo "${TAB1}Verificando arquivos essenciais..."
for file in package.json app.config.js; do
  [ -f "$file" ] || fail "Arquivo obrigatório não encontrado: $file"
done
echo "${TAB2}OK: Todos os arquivos obrigatórios encontrados."

has_gradle=0
if [ -f "android/app/build.gradle" ]; then
  has_gradle=1
  echo "${TAB2}OK: Arquivo opcional encontrado: android/app/build.gradle"
else
  echo "${TAB2}INFO: Arquivo opcional ausente: android/app/build.gradle"
fi
echo ""

echo "${TAB1}Preparando referência base..."
if [ "$base_ref" = "origin/main" ]; then
  if is_enabled "$AUTO_FETCH"; then
    echo "${TAB2}INFO: Atualizando origin/main automaticamente (AUTO_FETCH=1)."
    git fetch origin main:refs/remotes/origin/main >/dev/null 2>&1 || fail "Falha ao atualizar origin/main automaticamente. Rode 'git fetch origin main' e tente novamente."
    echo "${TAB2}OK: origin/main atualizado via fetch automático."
  else
    echo "${TAB2}INFO: Para garantir base atualizada, use AUTO_FETCH=1 ou rode 'git fetch origin main'."
  fi
fi
echo ""

echo "${TAB1}Validando refs de comparação..."
echo "${TAB2}Base ref: $base_ref"
echo "${TAB2}Head ref: $head_ref"

git rev-parse --verify "$base_ref" >/dev/null 2>&1 || fail "Base ref inválida ou ausente: $base_ref. Dica: rode 'git fetch origin main' ou use AUTO_FETCH=1."
git rev-parse --verify "$head_ref" >/dev/null 2>&1 || fail "Head ref inválida ou ausente: $head_ref"

echo "${TAB2}OK: Refs válidas."
echo ""

echo "${TAB1}Verificando arquivos alterados no intervalo..."
changed_files="$(git diff --name-only "$base_ref" "$head_ref" 2>/dev/null || true)"
[ -n "$changed_files" ] || {
  echo "${TAB2}OK: Sem arquivos alterados no intervalo informado. Check aprovado."
  exit 0
}
debug "Arquivos alterados no intervalo:"
if is_enabled "$VERBOSE"; then
  printf '%s\n' "$changed_files" | sed "s/^/${TAB2}- /"
fi

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
base_app_version="$(get_version_from_ref "$base_ref" app.config.js)"
head_app_version="$(get_version_from_ref "$head_ref" app.config.js)"

base_gradle_version=""
head_gradle_version=""
gradle_validation_enabled=0
if [ "$has_gradle" -eq 1 ] && file_exists_in_ref "$base_ref" android/app/build.gradle && file_exists_in_ref "$head_ref" android/app/build.gradle; then
  gradle_validation_enabled=1
  base_gradle_version="$(get_gradle_version_from_ref "$base_ref" android/app/build.gradle)"
  head_gradle_version="$(get_gradle_version_from_ref "$head_ref" android/app/build.gradle)"
elif [ "$has_gradle" -eq 1 ]; then
  echo "${TAB2}INFO: android/app/build.gradle não está versionado em uma ou ambas as refs comparadas; validação de versionName ignorada."
  debug "build.gradle em $base_ref: $(file_exists_in_ref "$base_ref" android/app/build.gradle && echo sim || echo nao)"
  debug "build.gradle em $head_ref: $(file_exists_in_ref "$head_ref" android/app/build.gradle && echo sim || echo nao)"
fi

echo "${TAB1}Comparando versões..."
echo "${TAB2}Versão base package.json: $base_package_version"
echo "${TAB2}Versão head package.json: $head_package_version"
echo "${TAB2}Versão base app.config.js: $base_app_version"
echo "${TAB2}Versão head app.config.js: $head_app_version"
if [ "$gradle_validation_enabled" -eq 1 ]; then
  echo "${TAB2}Versão base android/app/build.gradle (versionName): $base_gradle_version"
  echo "${TAB2}Versão head android/app/build.gradle (versionName): $head_gradle_version"
fi
echo ""

[ -n "$head_package_version" ] || fail "Não foi possível ler a versão de package.json no ref '$head_ref'."
[ -n "$head_app_version" ] || fail "Não foi possível ler a versão de app.config.js no ref '$head_ref'."
[ -n "$base_package_version" ] || fail "Não foi possível ler a versão de package.json no ref '$base_ref'."
[ -n "$base_app_version" ] || fail "Não foi possível ler a versão de app.config.js no ref '$base_ref'."

[ "$head_package_version" = "$head_app_version" ] || fail "Versões divergentes entre package.json ($head_package_version) e app.config.js ($head_app_version)."

if [ "$gradle_validation_enabled" -eq 1 ]; then
  [ -n "$head_gradle_version" ] || fail "Não foi possível ler a versão (versionName) de android/app/build.gradle no ref '$head_ref'."
  [ -n "$base_gradle_version" ] || fail "Não foi possível ler a versão (versionName) de android/app/build.gradle no ref '$base_ref'."

  [ "$head_package_version" = "$head_gradle_version" ] || fail "Versões divergentes entre package.json ($head_package_version) e android/app/build.gradle ($head_gradle_version)."
  [ "$head_app_version" = "$head_gradle_version" ] || fail "Versões divergentes entre app.config.js ($head_app_version) e android/app/build.gradle ($head_gradle_version)."
fi

if [ "$base_package_version" = "$head_package_version" ] && [ "$base_app_version" = "$head_app_version" ]; then
  fail "Houve alteração em src/ ou tests/, mas sem bump de versão. Atualize package.json e app.config.js (campo version) antes do merge."
fi

if [ "$gradle_validation_enabled" -eq 1 ] && [ "$base_gradle_version" = "$head_gradle_version" ]; then
  fail "Houve alteração em src/ ou tests/, mas sem bump em android/app/build.gradle (versionName)."
fi

echo "${TAB2}OK: Bump de versão detectado e consistente. Check aprovado."
