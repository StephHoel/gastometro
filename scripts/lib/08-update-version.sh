# Atualizações de versão
echo "$TAB1🔍 Atualizando versão para $new_version..."

today=$(date "+%Y-%m-%d")

sed -i.bak -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$new_version\"/" package.json
sed -i.bak -E "s/(\"version\"|version): \"[0-9]+\.[0-9]+\.[0-9]+\"/version: \"$new_version\"/" app.config.js

if [ -f "docs/SPEC.md" ]; then
	sed -i.bak -E "s/^> \*\*Versão do App:\*\* [0-9]+\.[0-9]+\.[0-9]+$/> **Versão do App:** $new_version/" docs/SPEC.md
	sed -i.bak -E "s/^> \*\*Data:\*\* [0-9]{4}-[0-9]{2}-[0-9]{2}$/> **Data:** $today/" docs/SPEC.md
	echo "${TAB2}✔ docs/SPEC.md atualizado (versão $new_version / data $today)"
fi

if [ -f "README.md" ]; then
	sed -i.bak -E "s|(Release-v)[0-9]+\.[0-9]+\.[0-9]+(-blue)|\1$new_version\2|" README.md
	echo "${TAB2}✔ README.md atualizado (badge de versão $new_version)"
fi

echo "${TAB1}🔍 Executando npm i para atualizar package-lock.json..."
npm i || {
  echo "${TAB2}❌ Falha ao executar npm i."
  exit 1
}
echo ""

echo "${TAB1}🔍 Atualizando versão do Service Worker (public/sw-version.js)..."
npm run sw:version || {
	echo "${TAB2}❌ Falha ao atualizar public/sw-version.js via npm run sw:version."
	exit 1
}
echo ""

if [ -f "android/app/build.gradle" ]; then
	sed -i.bak -E "s/versionName \"[0-9]+\.[0-9]+\.[0-9]+\"/versionName \"$new_version\"/" android/app/build.gradle
	echo "$TAB2✔ versionName nativo atualizado em android/app/build.gradle"
else
	echo "$TAB2ℹ android/app/build.gradle ausente. Atualização de versionName nativo ignorada."
fi

echo "$TAB2✔ Versão atualizada para $new_version"
echo ""