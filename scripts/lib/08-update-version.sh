# Atualizações de versão
echo "$TAB1🔍 Atualizando versão para $new_version..."

sed -i.bak -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$new_version\"/" package.json
sed -i.bak -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$new_version\"/" app.json
sed -i.bak -E "s/versionName \"[0-9]+\.[0-9]+\.[0-9]+\"/versionName \"$new_version\"/" android/app/build.gradle

echo "$TAB2✔ Versão atualizada para $new_version"
echo ""