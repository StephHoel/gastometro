# Obter versão atual do package.json
echo "$TAB1🔍 Obtendo versão atual do aplicativo..."
current_version=$(grep '"version":' package.json | head -n 1 | sed -E 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/')

echo "$TAB2✔ Versão atual: $current_version"
echo ""