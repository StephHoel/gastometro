# Função para incrementar versão
increment_version() {
  version=$1
  part=$2
  major=$(printf '%s' "$version" | cut -d. -f1)
  minor=$(printf '%s' "$version" | cut -d. -f2)
  patch=$(printf '%s' "$version" | cut -d. -f3)

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