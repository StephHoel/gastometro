#!/bin/sh

echo "🔍 Criando uma nova versão do aplicativo na branch atual..."

. ./scripts/lib/00-utils.sh
WIP_POPPED=0

trap 'rc=$?; if [ "$rc" -ne 0 ] && [ "${WIP_STASH_CREATED:-0}" = "1" ] && [ "${WIP_POPPED:-0}" = "0" ]; then echo "${TAB1}🔍 Restaurando alterações WIP antes de encerrar por erro..."; if git stash pop; then echo "${TAB2}✔ Alterações WIP restauradas com sucesso."; else echo "${TAB2}⚠ Falha ao aplicar stash automaticamente. Verifique conflitos e execute '\''git stash list'\''/'\''git stash pop'\'' manualmente."; fi; fi' EXIT

. ./scripts/lib/01-verify-git.sh
. ./scripts/lib/02-validate-current-branch.sh
. ./scripts/lib/03-verify-files.sh
. ./scripts/lib/04-verify-changelog.sh
. ./scripts/lib/05-get-version.sh
. ./scripts/lib/06-change-version.sh
. ./scripts/lib/08-update-version.sh
. ./scripts/lib/09-add-log.sh
. ./scripts/lib/10-normalize-changelog.sh
. ./scripts/lib/11-clear-files.sh
. ./scripts/lib/12-commit-changes.sh

echo "✔ Versão atualizada para $new_version"
echo "$TAB1➡ Publicando commit na branch atual..."
git push
