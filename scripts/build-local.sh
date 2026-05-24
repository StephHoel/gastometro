#!/bin/bash

# Abort on error, undefined var, or pipe failure
set -euo pipefail
trap 'rc=$?; echo ""; echo "❌ Erro ao executar: \"$BASH_COMMAND\" (código $rc). Abortando o build."; exit $rc' ERR

echo "🔍 Iniciando build local do Gastômetro..."
echo ""

# Salva o diretório inicial (raiz do repositório quando o script foi chamado)
START_PWD="$(pwd)"

echo "🧽 Limpando caches locais..."
rm -rf node_modules .gradle android/.gradle android/app/build android/build .expo .expo-shared
echo ""

echo "📦 Reinstalando dependências..."
npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund
echo "✅ Dependências instaladas"
echo ""

if [ ! -d "android" ]; then
  echo "📦 Executando 'expo prebuild'..."
  npx expo prebuild --platform android
  echo "✅ 'expo prebuild' concluído"
else
  echo "ℹ️ Pasta android/ já existe — pulando 'expo prebuild'."
fi
  echo ""

# echo "📦 Executando 'npx expo prebuild'..."
# npx expo prebuild --platform android
# echo "✅ 'expo prebuild' concluído"
# echo ""

echo "🔧 Ajustando expo build.gradle..."
# Note: patch_expo.js should be in the root
if [ -f patch_expo.js ]; then
  node patch_expo.js
  echo "✅ build.gradle ajustado"
else
  echo "⚠️ patch_expo.js não encontrado, pulando..."
fi
echo ""

echo "🧹 Removendo arquivos .webp..."
find . -type f -name "*.webp" -delete
echo "✔ Arquivos .webp removidos"
echo ""

echo "📁 Entrando em android/"
cd android/
echo ""

echo "🔧 Ajustando settings.gradle..."
# Note: patch_settings.js should be in the root
if [ -f ../patch_settings.js ]; then
  node ../patch_settings.js
  echo "✅ settings.gradle ajustado"
else
  echo "⚠️ patch_settings.js não encontrado, pulando..."
fi
echo ""

echo "⚙️  Iniciando build Gradle..."
chmod +x gradlew
./gradlew assembleRelease
echo ""

echo "📂 Coletando APK..."
cd ..
mkdir -p _apks
mv android/app/build/outputs/apk/release/app-arm64-v8a-release.apk "_apks/gastometro-$(date +"%Y%m%d%H%M%S").apk" || mv android/app/build/outputs/apk/release/app-release.apk "_apks/gastometro-$(date +"%Y%m%d%H%M%S").apk" || echo "⚠️ APK não encontrado em locais esperados"

echo "🎉 Build concluído! APK disponível em _apks/"
