# Commit das mudanças
echo "${TAB1}🔍 Comitando mudanças..."
git add package.json app.json android/app/build.gradle CHANGELOG.md
git commit -m "chore: versão $new_version – $changes"
echo "${TAB2}✔ Mudanças comitadas."
echo ""

if [ "${WIP_STASH_CREATED:-0}" = "1" ]; then
  git stash pop
fi
echo ""