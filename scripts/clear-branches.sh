#!/bin/sh

set -eu

script_dir="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$script_dir/clear-branches.csv"

# Defaults
DRY_RUN=1
DELETE_MODE="safe"
INCLUDE_MERGED=0

print_help() {
  cat <<'EOF'
Uso: sh ./scripts/clear-branches.sh [opções]

Opções:
  --yes, -y       Executa deleção de fato (padrão é dry-run)
  --dry-run       Apenas simula (padrão)
  --merged        Inclui branches locais com upstream que já foram mergeadas na default branch remota
  -f, --force     Usa deleção forçada (git branch -D) quando combinado com --yes
  -h, --help      Exibe esta ajuda

Exemplos:
  npm run clear:branches
  npm run clear:branches -- --yes
  npm run clear:branches -- --yes --merged
  npm run clear:branches -- --yes --merged -f
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --yes|-y)
      DRY_RUN=0
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    --merged)
      INCLUDE_MERGED=1
      ;;
    -f|--force)
      DELETE_MODE="force"
      ;;
    -h|--help)
      print_help
      exit 0
      ;;
    *)
      echo "❌ Opção inválida: $1"
      echo "Use --help para ver as opções disponíveis."
      exit 1
      ;;
  esac
  shift
done

if [ "$DELETE_MODE" = "force" ] && [ "$DRY_RUN" -eq 1 ]; then
  echo "ℹ️ Modo dry-run ativo: -f será aplicado apenas quando usar --yes."
fi

# Inicializa CSV de auditoria mínima
if [ ! -f "$LOG_FILE" ]; then
  printf '%s\n' "datetime;user;host;action;branch;result;detail" > "$LOG_FILE"
fi

log() {
  ts="$(date +"%Y-%m-%d %H:%M:%S")"
  user_name="${GIT_AUTHOR_NAME:-$(git config user.name 2>/dev/null || whoami 2>/dev/null || echo unknown)}"
  host_name="$(hostname 2>/dev/null || echo unknown)"
  action="$1"
  branch="$2"
  result="$3"
  detail="$4"

  # Garante uma linha CSV válida
  action_clean="$(printf '%s' "$action" | tr '\r\n' '  ' | sed 's/;/,/g')"
  branch_clean="$(printf '%s' "$branch" | tr '\r\n' '  ' | sed 's/;/,/g')"
  result_clean="$(printf '%s' "$result" | tr '\r\n' '  ' | sed 's/;/,/g')"
  detail_clean="$(printf '%s' "$detail" | tr '\r\n' '  ' | sed 's/;/,/g')"

  printf '%s;%s;%s;%s;%s;%s;%s\n' "$ts" "$user_name" "$host_name" "$action_clean" "$branch_clean" "$result_clean" "$detail_clean" >> "$LOG_FILE"
}

echo "🔍 Verificando repositório..."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "❌ Erro: execute este script dentro de um repositório Git."
  exit 1
}

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "❌ Remote 'origin' não encontrado."
  echo "💡 Verifique se o repositório possui remote configurado: git remote -v"
  log "precheck" "origin" "failed" "remote origin inexistente"
  exit 1
fi

echo "🌐 Atualizando e limpando referências remotas..."
fetch_tmp="$(mktemp)"
if ! git fetch --prune origin >"$fetch_tmp" 2>&1; then
  fetch_err="$(tr '\n' ' ' < "$fetch_tmp" | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//')"
  rm -f "$fetch_tmp"
  echo "❌ Falha ao executar git fetch --prune origin."
  echo "💡 Possíveis causas: sem rede, falta de permissão no remote, credenciais expiradas ou origin indisponível."
  if [ -n "$fetch_err" ]; then
    echo "🧾 Detalhe: $fetch_err"
  fi
  log "fetch" "origin" "failed" "$fetch_err"
  exit 1
fi
rm -f "$fetch_tmp"

default_ref="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)"
if [ -n "$default_ref" ]; then
  default_branch="${default_ref#origin/}"
else
  default_branch="$(git remote show origin 2>/dev/null | awk '/HEAD branch/ {print $NF; exit}')"
fi

if [ -z "$default_branch" ]; then
  default_branch="main"
  echo "⚠️ Não foi possível detectar origin/HEAD. Usando fallback: $default_branch"
fi

current_branch="$(git branch --show-current)"

protected_branches=""
add_protected() {
  candidate="$1"
  [ -z "$candidate" ] && return 0
  if printf '%s\n' "$protected_branches" | grep -Fx -- "$candidate" >/dev/null 2>&1; then
    return 0
  fi
  if [ -z "$protected_branches" ]; then
    protected_branches="$candidate"
  else
    protected_branches="$protected_branches
$candidate"
  fi
}

is_protected() {
  candidate="$1"
  printf '%s\n' "$protected_branches" | grep -Fx -- "$candidate" >/dev/null 2>&1
}

add_protected "main"
add_protected "develop"
add_protected "$default_branch"
add_protected "$current_branch"

echo "🛡️ Branches protegidas:"
printf '%s\n' "$protected_branches" | sed '/^$/d' | while IFS= read -r b; do
  echo "  - $b"
done

candidate_file="$(mktemp)"

add_candidate() {
  branch="$1"
  reason="$2"
  if awk -F'|' -v b="$branch" '$2 == b { found=1 } END { exit(found ? 0 : 1) }' "$candidate_file"; then
    return 0
  fi
  printf '%s|%s\n' "$reason" "$branch" >> "$candidate_file"
}

# Coleta de candidatos: apenas branches locais com upstream configurado.
# Se não foi para remoto (sem upstream), não faz nada com ela.
git for-each-ref --format='%(refname:lstrip=2)|%(upstream:short)|%(upstream:track)' refs/heads \
  | while IFS='|' read -r branch upstream track; do
      [ -z "$branch" ] && continue
      [ -z "$upstream" ] && continue

      if printf '%s' "$track" | grep -q '\[gone\]'; then
        add_candidate "$branch" "gone"
        continue
      fi

      if [ "$INCLUDE_MERGED" -eq 1 ]; then
        if git merge-base --is-ancestor "$branch" "origin/$default_branch" >/dev/null 2>&1; then
          add_candidate "$branch" "merged"
        fi
      fi
    done

candidate_count="$(awk 'NF {count++} END {print count+0}' "$candidate_file")"

if [ "$candidate_count" -eq 0 ]; then
  rm -f "$candidate_file"
  echo "✅ Nenhuma branch candidata foi encontrada."
  log "scan" "-" "ok" "nenhuma candidata (include_merged=$INCLUDE_MERGED)"
  exit 0
fi

echo "📌 Foram encontradas $candidate_count branch(es) candidata(s)."
if [ "$DRY_RUN" -eq 1 ]; then
  echo "🧪 Modo dry-run: nenhuma branch será removida. Use --yes para aplicar."
fi

deleted_count=0
skipped_count=0
failed_count=0

while IFS='|' read -r reason branch; do
  [ -z "$branch" ] && continue

  if is_protected "$branch"; then
    echo "🛡️ Ignorando branch protegida: $branch"
    log "delete" "$branch" "skipped" "protegida ($reason)"
    skipped_count=$((skipped_count + 1))
    continue
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "🧪 [DRY-RUN] Candidata à remoção ($reason): $branch"
    log "delete" "$branch" "dry-run" "candidata ($reason)"
    skipped_count=$((skipped_count + 1))
    continue
  fi

  if [ "$DELETE_MODE" = "force" ]; then
    delete_cmd="-D"
  else
    delete_cmd="-d"
  fi

  if git branch "$delete_cmd" "$branch" >/dev/null 2>&1; then
    echo "🗑️ Branch removida ($reason): $branch"
    log "delete" "$branch" "deleted" "$reason via $delete_cmd"
    deleted_count=$((deleted_count + 1))
  else
    echo "⚠️ Não foi possível remover a branch ($reason): $branch"
    if [ "$DELETE_MODE" != "force" ]; then
      echo "💡 Se quiser forçar a remoção, execute novamente com -f --yes"
    fi
    log "delete" "$branch" "failed" "$reason via $delete_cmd"
    failed_count=$((failed_count + 1))
  fi
done < "$candidate_file"

rm -f "$candidate_file"

echo ""
echo "✅ Concluído."
echo "📊 Resumo final:"
echo "  - Removidas: $deleted_count"
echo "  - Ignoradas: $skipped_count"
echo "  - Falhas:    $failed_count"

log "summary" "-" "ok" "deleted=$deleted_count skipped=$skipped_count failed=$failed_count dry_run=$DRY_RUN include_merged=$INCLUDE_MERGED mode=$DELETE_MODE default=$default_branch"
