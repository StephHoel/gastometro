#!/bin/bash

TAB="    "

echo "🔍 Iniciando script de upload de APK na release existente"
echo ""

# Solicita ao usuário a tag
# read -p "$TAB👀 Digite a tag da release (exemplo: v1.3): " TAG
# echo ""

# Verifica se a tag foi fornecida
while [ -z "$TAG" ]; do
  read -p "$TAB👀 Digite a tag da release (exemplo: v1.3) ou pressione Ctrl+C para sair: " TAG
done


# if [ -z "$TAG" ]; then
#   echo "$TAB$TAB❌ Nenhuma tag fornecida. Tente novamente Por favor, insira uma tag válida e tente novamente."
#   exit 1
# fi

# Define o nome e o caminho do arquivo APK
APK_NAME="gastometro-$TAG.apk"
APK_PATH="_apks/$APK_NAME"

# Verifica se o arquivo APK existe no diretório _apks/
if [ ! -f "$APK_PATH" ]; then
  echo "ERROR: O arquivo $APK_PATH não foi encontrado."
  echo "Certifique-se de que o arquivo existe no diretório _apks/ antes de continuar."
  exit 1
fi

# Executa os comandos usando a tag fornecida
echo "Executando comandos com a tag: $TAG"

# Tenta deletar o asset e verifica se o release existe
DELETE_OUTPUT=$(gh release delete-asset "$TAG" "$APK_NAME" -y 2>&1)
if [[ "$DELETE_OUTPUT" == *"release not found"* ]]; then
  echo "ERROR: Release não encontrado para a tag $TAG."
  echo "Certifique-se de que a tag está correta ou crie a release antes de continuar."
  exit 1
fi

# Faz o upload do arquivo APK para a release
UPLOAD_OUTPUT=$(gh release upload "$TAG" "$APK_PATH" --clobber 2>&1)
if [ $? -ne 0 ]; then
  echo "ERROR: Falha ao fazer upload do arquivo $APK_PATH para a release $TAG."
  echo "Detalhes do erro: $UPLOAD_OUTPUT"
  exit 1
fi

# Move o arquivo APK para o diretório _apks/uploaded/
mv "$APK_PATH" "_apks/uploaded/$APK_NAME"
if [ $? -ne 0 ]; then
  echo "ERROR: Falha ao mover o arquivo $APK_PATH para o diretório _apks/uploaded/."
  exit 1
fi

echo ""
echo "=== Comandos executados com sucesso! O arquivo foi enviado e movido para _apks/uploaded/ ==="