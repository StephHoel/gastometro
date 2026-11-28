# Verificação de arquivos essenciais
echo "$TAB1🔍 Verificando arquivos essenciais..."

for file in package.json app.config.js; do
  if [ ! -f "$file" ]; then
    echo "$TAB2❌ Arquivo obrigatório não encontrado: $file"
    exit 1
  fi
done

echo "$TAB2✔ Todos os arquivos obrigatórios encontrados."

if [ -f "android/app/build.gradle" ]; then
  echo "$TAB2✔ Arquivo opcional encontrado: android/app/build.gradle"
else
  echo "$TAB2ℹ Arquivo opcional ausente: android/app/build.gradle (fluxo continuará sem atualizar versionName nativo)."
fi
echo ""