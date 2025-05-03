#!/bin/bash

echo "🔍  Iniciando script de build local..."
echo ""

expo prebuild

cd android/

./gradlew build

./gradlew assembleRelease

cd app/build/outputs/apk/release/

mv "app-arm64-v8a-release.apk" "../../../../../../_apks/gastometro-$(date +"%Y%m%d%H%M%S").apk"

cd ../../../../../../

echo ""
echo "✔ Build finalizado!"