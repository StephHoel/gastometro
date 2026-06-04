# Commit das mudanças
echo "${TAB1}🔍 Comitando mudanças..."
echo "${TAB1}🔍 Executando npm i para atualizar package-lock.json..."
npm i || {
  echo "${TAB2}❌ Falha ao executar npm i. Commit cancelado."
  exit 1
}

if [ ! -f "package-lock.json" ]; then
  echo "${TAB2}❌ package-lock.json não encontrado após npm i. Commit cancelado."
  exit 1
fi

files_to_add=(package.json package-lock.json app.json docs/CHANGELOG.md)

if [ -f "android/app/build.gradle" ]; then
  files_to_add+=(android/app/build.gradle)
fi

git add "${files_to_add[@]}"
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