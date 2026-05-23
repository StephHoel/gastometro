#!/bin/bash

# Abort on error, undefined var, or pipe failure
set -euo pipefail

# Mostrar mensagem amigável quando qualquer comando falhar
trap 'rc=$?; echo ""; echo "❌ Erro ao executar: \"$BASH_COMMAND\" (código $rc). Abortando o build."; exit $rc' ERR

echo "🔍 Iniciando build local do Gastômetro..."
echo ""

# Salva o diretório inicial (raiz do repositório quando o script foi chamado)
START_PWD="$(pwd)"

echo "📦 Executando 'expo prebuild'..."
expo prebuild
echo "✅ 'expo prebuild' concluído"
echo ""

echo "🧹 Removendo arquivos .webp desnecessários..."
find . -type f -name "*.webp" -delete
echo "✔ Arquivos .webp removidos"
echo ""

echo "📁 Entrando em android/"
cd android/
echo ""

echo "⚙️  Iniciando build Gradle (padrão)..."
./gradlew build
echo ""

echo "📦 Gerando APK release com Gradle..."
./gradlew assembleRelease
echo ""

echo "📂 Acessando pasta de saída do APK..."
cd app/build/outputs/apk/release/
echo ""

echo "📤 Movendo e renomeando APK para _apks/ (timestamp incluido)"
APKS_DIR="$START_PWD/_apks"
echo ""

if [ ! -d "$APKS_DIR" ]; then
	echo "📁 Diretório _apks não existe — criando: $APKS_DIR"
	mkdir -p "$APKS_DIR"
    echo ""
else
	echo "📁 Diretório _apks existe: $APKS_DIR"
    echo ""
fi

mv "app-arm64-v8a-release.apk" "$APKS_DIR/gastometro-$(date +"%Y%m%d%H%M%S").apk"

cd $START_PWD

echo ""
echo "🎉 Build finalizado com sucesso! APK disponível em _apks/"