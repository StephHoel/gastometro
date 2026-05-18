# Garante que branch release existe e faz checkout
echo "$TAB1🔍 Verificando branch 'main'..."
if git show-ref --quiet refs/heads/main; then
  echo "$TAB2✔ Branch 'main' encontrada."
  echo ""
  
  echo "$TAB1🔍 Verificando mudanças pendentes..."
  if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo "$TAB2✔ Mudanças pendentes detectadas."
    echo "$TAB1🔍 Criando Stash WIP..."
    git add .
    git stash save "WIP"
    echo "$TAB2✔ Mudanças pendentes stashed como WIP."
    echo ""
  else
    echo "$TAB2✔ Nenhuma mudança pendente."
    echo ""
  fi
    
  echo "$TAB2🔍 Mudando para branch 'main'..."
  git checkout main && git pull origin main
  echo "$TAB3✔ Mudança para branch 'main' concluída."
else
  echo "$TAB2❌ A branch 'main' não existe."
  exit 1
fi

echo ""