#!/bin/bash

set -euo pipefail

echo "🔍 Verificando repositorio..."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "❌ Erro: execute este script dentro de um repositorio Git."
  exit 1
}

echo "🌐 Atualizando e limpando referencias remotas..."
git fetch --prune

current_branch=$(git branch --show-current)

# Branches that should never be deleted by this script.
protected_branches=("main" "develop" "$current_branch")

is_protected() {
  local branch="$1"
  for protected in "${protected_branches[@]}"; do
    if [ "$branch" = "$protected" ]; then
      return 0
    fi
  done
  return 1
}

mapfile -t gone_branches < <(
  git for-each-ref --format='%(refname:short)|%(upstream:track)' refs/heads \
    | awk -F'|' '$2 ~ /\[gone\]/ { print $1 }'
)

if [ "${#gone_branches[@]}" -eq 0 ]; then
  echo "✅ Nenhuma branch local com upstream removido foi encontrada."
  exit 0
fi

echo "📌 Foram encontradas ${#gone_branches[@]} branch(es) local(is) com upstream removido."

deleted_count=0
skipped_count=0
failed_count=0

for branch in "${gone_branches[@]}"; do
  if is_protected "$branch"; then
    echo "🛡️ Ignorando branch protegida: $branch"
    skipped_count=$((skipped_count + 1))
    continue
  fi

  if git branch -D "$branch"; then
    echo "🗑️ Branch removida: $branch"
    deleted_count=$((deleted_count + 1))
  else
    echo "⚠️ Nao foi possivel remover a branch com -D: $branch"
    # echo "Se quiser forcar a remocao, execute: git branch -D $branch"
    failed_count=$((failed_count + 1))
  fi
done

echo ""
echo "✅ Concluido."
echo "📊 Resumo final:"
echo "  - Removidas: $deleted_count"
echo "  - Ignoradas: $skipped_count"
echo "  - Falhas:    $failed_count"
