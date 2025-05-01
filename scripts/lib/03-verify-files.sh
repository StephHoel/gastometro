# Verificação de arquivos essenciais
echo "$TAB1🔍 Verificando arquivos essenciais..."

for file in package.json app.json android/app/build.gradle; do
  if [ ! -f "$file" ]; then
    echo "$TAB2❌ Arquivo obrigatório não encontrado: $file"
    exit 1
  fi
done

echo "$TAB2✔ Todos os arquivos obrigatórios encontrados."
echo ""