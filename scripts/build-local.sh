#!/bin/bash

# Abort on error, undefined var, or pipe failure
set -euo pipefail
trap 'rc=$?; echo ""; echo "❌ Erro ao executar: \"$BASH_COMMAND\" (código $rc). Abortando o build."; exit $rc' ERR

echo "🔍 Iniciando build local do Gastômetro..."
echo ""

# Salva o diretório inicial (raiz do repositório quando o script foi chamado)
START_PWD="$(pwd)"

echo "🧽 Limpando caches locais..."
rm -rf node_modules android .gradle .expo .expo-shared
echo ""

echo "📦 Reinstalando dependências..."
# npm install --legacy-peer-deps
npm install --loglevel=error
echo "✅ Dependências instaladas"
echo ""

echo "📦 Executando expo prebuild limpo (recria android/)..."
npx expo prebuild --platform android --clean
echo "✅ expo prebuild concluído"
echo ""

echo "🧹 Removendo arquivos .webp..."
find . -type f -name "*.webp" -delete
echo "✔ Arquivos .webp removidos"
echo ""

echo "📁 Entrando em android/"
cd android/
echo ""

echo "⚙️  Iniciando build Gradle..."
chmod +x gradlew
./gradlew assembleRelease --warning-mode all
echo ""

echo "📂 Coletando APK..."
cd ..
mkdir -p 
mv android/app/build/outputs/apk/release/*.apk "_apks/gastometro-$(date +"%Y%m%d%H%M%S").apk" || echo "⚠️ APK não encontrado em locais esperados"

echo "🎉 Build concluído! APK disponível em _apks/"
