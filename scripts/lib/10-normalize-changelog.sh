# Arquivo alvo
FILE="CHANGELOG.md"

echo "$TAB1❗ Iniciando a normalização do arquivo $FILE."
echo "$TAB2🔍 Movendo o título para o topo..."
awk '
BEGIN { 
  blank=0; 
  started=0; 
  title=""; 
  output=""; 
}
/^# Changelog$/ {
  title = "# Changelog"
  next
}
/^$/ {
  if (!started) next
  if (blank == 0) { 
    output = output "\n"; 
    blank = 1 
  }
  next
}
/./ {
  output = output $0 "\n"
  blank = 0
  started = 1
}
END {
  if (title == "") title = "# Changelog"
  print title
  print ""
  printf "%s", output
}
' "$FILE" > "$FILE.tmp"

echo "$TAB3✔ Título no topo."

# Garante exatamente uma linha em branco no final
echo "$TAB2🔍 Garantindo que o arquivo tenha exatamente uma linha em branco no final..."
sed -Ez 's/(\n[[:space:]]*)*\n?$/\n/' "$FILE.tmp" > "$FILE"
echo "$TAB3✔ Linha em branco final garantida."

# Limpa temporário
echo "$TAB2🔍 Removendo arquivo temporário..."
rm "$FILE.tmp"
echo "$TAB3✔ Arquivo temporário removido."

echo "$TAB1✔ Normalização do arquivo concluída."
echo ""
