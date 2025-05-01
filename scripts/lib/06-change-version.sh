echo "${TAB1}🚧 Tipos de atualização"
echo "${TAB2}Patch: Correções pequenas e ajustes não visíveis ao usuário final"
echo "${TAB2}Minor: Novas funcionalidades sem quebrar compatibilidade"
echo "${TAB2}Major: Mudanças grandes que podem quebrar compatibilidade anterior"
echo ""
echo "${TAB1}❗ Escolha o tipo de atualização:"
echo "${TAB2}1) Patch (ex: $current_version -> $(increment_version $current_version patch))"
echo "${TAB2}2) Minor (ex: $current_version -> $(increment_version $current_version minor))"
echo "${TAB2}3) Major (ex: $current_version -> $(increment_version $current_version major))"
echo "${TAB2}4) Especificar versão manualmente"
read -p "${TAB3}Digite sua opção: " option

case $option in
  1) new_version=$(increment_version $current_version patch) ;;
  2) new_version=$(increment_version $current_version minor) ;;
  3) new_version=$(increment_version $current_version major) ;;
  4) read -p "${TAB4}👀 Digite a nova versão (ex: 2.1.0): " new_version ;;
  *) echo "${TAB4}❌ Opção inválida"; exit 1 ;;
esac

echo ""