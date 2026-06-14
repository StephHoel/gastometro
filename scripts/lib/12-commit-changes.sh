# Commit das mudanças
echo "${TAB1}🔍 Comitando mudanças..."

if [ ! -f "package-lock.json" ]; then
  echo "${TAB2}❌ package-lock.json não encontrado. Commit cancelado."
  exit 1
fi

git add package.json package-lock.json app.config.js docs/CHANGELOG.md

if [ -f "android/app/build.gradle" ]; then
  git add android/app/build.gradle
fi
git commit -m "chore: versão $new_version – $changes"
echo "${TAB2}✔ Mudanças comitadas."
echo ""

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