# Atualizações de versão
echo "$TAB1🔍 Atualizando versão para $new_version..."

sed -i.bak -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$new_version\"/" package.json
sed -i.bak -E "s/(\"version\"|version): \"[0-9]+\.[0-9]+\.[0-9]+\"/version: \"$new_version\"/" app.config.js

echo "${TAB1}🔍 Executando npm i para atualizar package-lock.json..."
npm i || {
  echo "${TAB2}❌ Falha ao executar npm i."
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