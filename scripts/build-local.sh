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

echo "🛠️ Aplicando otimizações de tamanho no android/gradle.properties..."
set_prop() {
	key="$1"
	value="$2"
	file="$3"
	if grep -q "^${key}=" "$file"; then
		sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
    rm -f "${file}.bak"
	else
		if [ -s "$file" ] && [ "$(tail -c 1 "$file" 2>/dev/null || true)" != "" ]; then
			echo "" >> "$file"
		fi
		echo "${key}=${value}" >> "$file"
	fi
}

set_prop "newArchEnabled" "false" "android/gradle.properties"
set_prop "expo.gif.enabled" "false" "android/gradle.properties"
set_prop "expo.webp.enabled" "false" "android/gradle.properties"
set_prop "EX_DEV_CLIENT_NETWORK_INSPECTOR" "false" "android/gradle.properties"
set_prop "reactNativeArchitectures" "arm64-v8a" "android/gradle.properties"
set_prop "expo.useLegacyPackaging" "true" "android/gradle.properties"
set_prop "android.enableBundleCompression" "true" "android/gradle.properties"

if ! grep -q 'resConfigs "en", "pt-rBR"' android/app/build.gradle; then
	sed -i.bak '/targetSdkVersion rootProject.ext.targetSdkVersion/a\        resConfigs "en", "pt-rBR"' android/app/build.gradle
  rm -f android/app/build.gradle.bak
fi
echo "✅ Otimizações aplicadas"
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
export ORG_GRADLE_PROJECT_reactNativeArchitectures="arm64-v8a"
./gradlew assembleRelease --warning-mode all
echo ""

echo "📂 Coletando APK..."
cd "$START_PWD" || true
mkdir -p _apks

# Find the most recently modified APK under android/app/build
# Prefer arm64 release output and select the smallest APK available.
latest_apk=$(find android/app/build -type f -name "*.apk" \
	! -name "*unaligned*" \
	! -name "*debug*" \
	-print 2>/dev/null | while IFS= read -r f; do
		size=$(wc -c < "$f" 2>/dev/null || echo 0)
		echo "$size|$f"
	done | sort -n | head -n 1 | cut -d'|' -f2- || true)

if [ -z "$latest_apk" ]; then
	echo "⚠️ APK não encontrado em locais esperados"
else
	target="_apks/gastometro-$(date +"%Y%m%d%H%M%S").apk"
	mv "$latest_apk" "$target"
	echo "✅ APK movido: $target"
fi
echo ""

echo "🎉 Build concluído!"
