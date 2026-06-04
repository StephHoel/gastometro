# Cria WIP antes da validacao da branch atual
WIP_STASH_CREATED=0
echo "$TAB1🔍 Verificando mudanças pendentes..."

if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "$TAB2✔ Mudanças pendentes detectadas."
  echo "$TAB1🔍 Criando Stash WIP..."
  git add .
  git stash save "WIP"
  WIP_STASH_CREATED=1
  echo "$TAB2✔ Mudanças pendentes stashed como WIP."
else
  echo "$TAB2✔ Nenhuma mudança pendente."
fi
echo ""

echo "$TAB1🔍 Verificando se branch atual não é main..."
current_branch=$(git branch --show-current)

if [ "$current_branch" = "main" ]; then
  echo "$TAB2❌ Branch não pode ser main"

  if [ "$WIP_STASH_CREATED" = "1" ]; then
    echo "$TAB1🔍 Restaurando alterações WIP antes de encerrar..."
    git stash pop >/dev/null 2>&1 || true
  fi

  exit 1
fi

echo "$TAB2✔ Branch atual '$current_branch' validada."
echo ""