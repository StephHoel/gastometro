#!/bin/sh

# Abort on error and undefined variables
set -eu

echo "🔍 Iniciando build local do Gastômetro..."
echo ""

# Salva o diretório inicial (raiz do repositório quando o script foi chamado)
START_PWD="$(pwd)"

echo "🧽 Limpando caches locais..."
rm -rf node_modules android .gradle .expo .expo-shared
echo ""

echo "📦 Reinstalando dependências..."
npm install --loglevel=error
echo "✅ Dependências instaladas"
echo ""

echo "🧪 Executando testes automatizados..."
npm run test:coverage
echo "✅ Testes aprovados"
echo ""

echo "📦 Executando expo prebuild limpo (recria android/)..."
npx expo prebuild --platform android --clean
echo "✅ expo prebuild concluído"
echo ""

# # echo "🧹 Removendo arquivos .webp..."
# # find . -type f -name "*.webp" -delete
# # echo "✔ Arquivos .webp removidos"
# # echo ""

echo "📁 Entrando em android/"
cd android/
echo ""

echo "⚙️  Iniciando build Gradle..."
chmod +x gradlew
./gradlew assembleRelease --warning-mode all
echo ""

echo "📂 Coletando APK..."
cd "$START_PWD" || true
mkdir -p _apks

# Find the most recently modified APK under android/app/build
latest_apk=$(find android/app/build -type f -name "*.apk" -exec ls -t {} + 2>/dev/null | head -n 1 || true)

if [ -z "$latest_apk" ]; then
	echo "⚠️ APK não encontrado em locais esperados"
else
	target="_apks/gastometro-$(date +"%Y%m%d%H%M%S").apk"
	mv "$latest_apk" "$target"
	echo "✅ APK movido: $target"
fi
echo ""

echo "🎉 Build concluído!"
