#!/bin/bash

echo "🔍 Criando uma nova versão do aplicativo em uma nova branch..."

source ./scripts/lib/00-utils.sh
source ./scripts/lib/01-verify-git.sh
source ./scripts/lib/02-checkout-release.sh
source ./scripts/lib/03-verify-files.sh
source ./scripts/lib/04-verify-changelog.sh
source ./scripts/lib/05-get-version.sh
source ./scripts/lib/06-change-version.sh
source ./scripts/lib/07-checkout-new-branch.sh
source ./scripts/lib/08-update-version.sh
source ./scripts/lib/09-add-log.sh
source ./scripts/lib/10-normalize-changelog.sh
source ./scripts/lib/11-clear-bak.sh
source ./scripts/lib/12-commit-changes.sh

echo "✔ Versão atualizada para $new_version na branch $branch_name"
echo "$TAB1➡ Execute 'git push origin $branch_name' para publicar a nova branch."
