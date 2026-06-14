# Arquivo alvo
FILE="docs/CHANGELOG.md"

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
/^[[:space:]]*$/ {
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

# Garante apenas quebra de linha final, sem linha em branco extra
echo "$TAB2🔍 Garantindo quebra de linha final sem linha em branco extra..."
awk '
{
  line = $0
  sub(/\r$/, "", line)
  lines[NR] = line
}
END {
  last = NR
  while (last > 0 && lines[last] ~ /^[[:space:]]*$/) {
    last--
  }

  for (i = 1; i <= last; i++) {
    print lines[i]
  }
}
' "$FILE.tmp" > "$FILE"
echo "$TAB3✔ Quebra de linha final garantida sem linha em branco extra."

# Limpa temporário
echo "$TAB2🔍 Removendo arquivo temporário..."
rm "$FILE.tmp"
echo "$TAB3✔ Arquivo temporário removido."

echo "$TAB1✔ Normalização do arquivo concluída."
echo ""
