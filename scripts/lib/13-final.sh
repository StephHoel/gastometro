# Finalizando commitando ou não

if [ "$COMMIT_ARG" != 'n' ]; then
  . ./scripts/lib/12-commit-changes.sh

  echo "✔ Versão atualizada para $new_version"
  echo "$TAB1➡ Publicando commit na branch atual..."
  git push
else
  echo "✔ Versão atualizada para $new_version (sem commit)"
fi

if [ "${WIP_STASH_CREATED:-0}" = "1" ]; then
  echo "${TAB1}🔍 Restaurando alterações WIP do stash..."
  if git stash pop; then
    WIP_POPPED=1
    echo "${TAB2}✔ Alterações WIP restauradas com sucesso."
  else
    WIP_POPPED=1
    echo "${TAB2}⚠ Falha ao aplicar stash automaticamente. Verifique conflitos e execute 'git stash list'/'git stash pop' manualmente."
  fi
fi
echo ""