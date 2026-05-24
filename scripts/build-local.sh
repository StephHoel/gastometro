#!/bin/bash

# Abort on error, undefined var, or pipe failure
set -euo pipefail

# Mostrar mensagem amigável quando qualquer comando falhar
trap 'rc=$?; echo ""; echo "❌ Erro ao executar: \"$BASH_COMMAND\" (código $rc). Abortando o build."; exit $rc' ERR

echo "🔍 Iniciando build local do Gastômetro..."
echo ""

# Salva o diretório inicial (raiz do repositório quando o script foi chamado)
START_PWD="$(pwd)"

if [ ! -d "android" ]; then
  echo "📦 Executando 'expo prebuild'..."
  expo prebuild
  echo "✅ 'expo prebuild' concluído"
  echo ""
else
  echo "ℹ️ Pasta android/ já existe — pulando 'expo prebuild'."
  echo ""
fi

echo "🧹 Removendo arquivos .webp desnecessários..."
find . -type f -name "*.webp" -delete
echo "✔ Arquivos .webp removidos"
echo ""

echo "📁 Entrando em android/"
cd android/
echo ""

if command -v mise >/dev/null 2>&1; then
  JAVA17_HOME="$(mise where java@17.0.2 2>/dev/null || true)"
  if [ -n "${JAVA17_HOME}" ] && [ -d "${JAVA17_HOME}" ]; then
    export JAVA_HOME="${JAVA17_HOME}"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "☕ Usando Java 17 em $JAVA_HOME"
    echo ""
  fi
fi

if [ -x "./gradlew" ]; then
  GRADLE_CMD="./gradlew"
else
  GRADLE_CMD="gradle"
fi

echo "⚙️  Iniciando build Gradle (padrão)..."
$GRADLE_CMD build
echo ""

echo "📦 Gerando APK release com Gradle..."
$GRADLE_CMD assembleRelease
echo ""

echo "📂 Acessando pasta de saída do APK..."
cd app/build/outputs/apk/release/
echo ""

echo "📤 Movendo e renomeando APK para _apks/ (timestamp incluído)"
APKS_DIR="$START_PWD/_apks"
if [ ! -d "$APKS_DIR" ]; then
  echo "📁 Diretório _apks não existe — criando: $APKS_DIR"
  mkdir -p "$APKS_DIR"
else
  echo "📁 Diretório _apks existe: $APKS_DIR"
fi
echo ""

mv "app-arm64-v8a-release.apk" "$APKS_DIR/gastometro-$(date +"%Y%m%d%H%M%S").apk"

cd "$START_PWD"

echo ""
echo "🎉 Build finalizado com sucesso! APK disponível em _apks/"
