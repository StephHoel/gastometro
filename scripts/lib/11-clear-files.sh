# Remoção dos .bak
echo "${TAB1}🔍 Removendo arquivos .bak..."
find . -type f -name '*.bak' -exec rm -f {} +
echo "${TAB2}✔ Arquivos .bak removidos com sucesso."
echo ""
