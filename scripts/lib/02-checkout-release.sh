# Garante que branch release existe e faz checkout
echo "$TAB1🔍 Verificando branch 'release'..."
if git show-ref --quiet refs/heads/release; then
  echo "$TAB2✔ Branch 'release' encontrada."
  echo ""
  
  echo "$TAB1🔍 Verificando mudanças pendentes..."
  if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo "$TAB2✔ Mudanças pendentes detectadas."
    echo "$TAB1🔍 Comitando como WIP..."
    git add .
    git commit -m "WIP"
    echo "$TAB2✔ Mudanças pendentes comitadas como WIP."
    echo ""
  else
    echo "$TAB2✔ Nenhuma mudança pendente."
    echo ""
  fi
    
  echo "$TAB2🔍 Mudando para branch 'release'..."
  git checkout release && git pull origin release
  echo "$TAB3✔ Mudança para branch 'release' concluída."
else
  echo "$TAB2❌ A branch 'release' não existe."
  exit 1
fi

echo ""