# Verificação de repositório git

echo "$TAB1🔍 Verificando repositório Git..."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "$TAB2❌ Este script precisa ser executado dentro de um repositório Git."
  exit 1
}
echo "$TAB2✔ Repositório Git encontrado."
echo ""
