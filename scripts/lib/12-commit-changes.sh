# Commit das mudanças
echo "${TAB1}🔍 Comitando mudanças..."

if [ ! -f "package-lock.json" ]; then
  echo "${TAB2}❌ package-lock.json não encontrado. Commit cancelado."
  exit 1
fi

git add package.json package-lock.json app.config.js docs/CHANGELOG.md public/sw-version.js

if [ -f "android/app/build.gradle" ]; then
  git add android/app/build.gradle
fi
git commit -m "chore: versão $new_version – $changes"
echo "${TAB2}✔ Mudanças comitadas."
echo ""
