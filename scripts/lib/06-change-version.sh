select_version() {
  echo "${TAB1}🚧 Tipos de atualização"
  echo "${TAB2}Patch: Correções pequenas e ajustes não visíveis ao usuário final"
  echo "${TAB2}Minor: Novas funcionalidades sem quebrar compatibilidade"
  echo "${TAB2}Major: Mudanças grandes que podem quebrar compatibilidade anterior"
  echo ""
  echo "${TAB1}❗ Escolha o tipo de atualização:"
  echo "${TAB2}1) Patch (ex: $current_version -> $(increment_version "$current_version" patch))"
  echo "${TAB2}2) Minor (ex: $current_version -> $(increment_version "$current_version" minor))"
  echo "${TAB2}3) Major (ex: $current_version -> $(increment_version "$current_version" major))"
  echo "${TAB2}4) Especificar versão manualmente"
  if [ -n "$VERSION_TYPE_ARG" ]; then
    option="$VERSION_TYPE_ARG"
    echo "${TAB3}Opção recebida via argumento: $option"
  else
    printf "%s" "${TAB3}Digite sua opção: "
    IFS= read -r option
  fi

  case $option in
    1) new_version=$(increment_version "$current_version" patch) ;;
    2) new_version=$(increment_version "$current_version" minor) ;;
    3) new_version=$(increment_version "$current_version" major) ;;
    4)
      printf "%s" "${TAB4}👀 Digite a nova versão (ex: 2.1.0): "
      IFS= read -r new_version
      ;;
    *) new_version="$option" ;;
  esac

  if ! printf '%s\n' "$new_version" | LC_ALL=C awk '
    /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/ { valid = 1 }
    END { exit !(NR == 1 && valid) }
  '; then
    echo "${TAB4}❌ Versão inválida. Use o formato X.Y.Z (ex: 2.1.0)." >&2
    exit 1
  fi

  echo ""
}