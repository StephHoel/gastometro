# Função para incrementar versão
increment_version() {
  local version=$1
  local part=$2
  IFS='.' read -r major minor patch <<< "$version"

  case $part in
    major) major=$((major + 1)); minor=0; patch=0 ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    patch) patch=$((patch + 1)) ;;
  esac

  echo "$major.$minor.$patch"
}

TAB1="    "
TAB2="$TAB1$TAB1"
TAB3="$TAB1$TAB1$TAB1"
TAB4="$TAB1$TAB1$TAB1$TAB1"