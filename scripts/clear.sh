#!/bin/bash

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$script_dir/clear.csv"

# Inicializa o arquivo de log com header CSV se não existir
if [ ! -f "$LOG_FILE" ]; then
	printf '%s\n' "datetime;message" > "$LOG_FILE"
fi

# Escreve uma entrada no log em formato CSV: datetime;message
log() {
	local ts
	ts="$(date +"%Y-%m-%d %H:%M:%S")"
	local msg
	msg="$*"

	# Remover possíveis pontos-e-vírgulas e converter quebras de linha em espaço para manter uma única linha CSV
	msg="$(echo "$msg" | tr '\n' ' ' | sed 's/;/,/g' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"

	# Não registrar entradas vazias
	if [ -n "$msg" ]; then
		printf '%s;%s\n' "$ts" "$msg" >> "$LOG_FILE"
	fi
}

# Executa comando, captura saída (stdout+stderr) e registra resultado no log sem imprimir no terminal
run_and_log() {
	local description="$1"
	shift
	local tmp
	tmp=$(mktemp)

	# Executa o comando redirecionando stdout+stderr para arquivo temporário
	"$@" >"$tmp" 2>&1
	local exit_code=$?
	local output

	output=$(tr '\n' ' ' < "$tmp" | sed 's/;/,/g' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')
	rm -f "$tmp"
    echo $output

	if [ $exit_code -eq 0 ]; then
		if [ -n "$output" ]; then
			log "$description - concluído com sucesso. Saída: $output"
		else
			log "$description - concluído com sucesso."
		fi
	else
		if [ -n "$output" ]; then
			log "$description - falhou (exit $exit_code). Saída: $output"
		else
			log "$description - falhou (exit $exit_code)."
		fi
	fi
	return $exit_code
}

log "Iniciando limpeza do projeto"

log "Removendo pastas: node_modules package-lock.json .expo android"
run_and_log "Remover pastas" rm -rf node_modules package-lock.json .expo android

run_and_log "Instalar dependências (npm install)" npm install

log "Removendo pacotes não listados no package.json (npm prune)"
# Esse comando limpa o que estiver instalado no node_modules mas não listado no package.json.
run_and_log "npm prune" npm prune

log "Removendo dependências duplicadas no node_modules (npm dedupe)"
# Organiza o node_modules, agrupando dependências iguais em uma hierarquia mais eficiente
run_and_log "npm dedupe" npm dedupe

log "Limpeza e normalização de dependências concluídas"

echo "✔ Instalações e dependências limpas!"

log "Finalizando script clear.sh"
