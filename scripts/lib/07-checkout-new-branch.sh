branch_name="release/v$new_version"

# Verifica se a nova branch já existe
echo "$TAB1🔍 Verificando se a branch '$branch_name' não existe..."

if git show-ref --verify --quiet refs/heads/"$branch_name"; then
  echo "$TAB2❌ A branch '$branch_name' já existe. Use outra versão."
  exit 1
fi

echo "$TAB2✔ A branch '$branch_name' não existe."
echo ""

# Cria nova branch a partir da release
echo "$TAB1🔍 Criando nova branch '$branch_name'..."
git checkout -b "$branch_name" || {
  echo "$TAB2❌ Não foi possível criar a branch '$branch_name'."
  exit 1
}

echo "$TAB2✔ Branch '$branch_name' criada com sucesso."
echo ""