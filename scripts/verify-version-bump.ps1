$ErrorActionPreference = 'Stop'

$baseRef = if ($args.Count -ge 1 -and -not [string]::IsNullOrWhiteSpace($args[0])) {
  $args[0]
} elseif ($env:BASE_SHA) {
  $env:BASE_SHA
} else {
  'origin/main'
}

$headRef = if ($args.Count -ge 2 -and -not [string]::IsNullOrWhiteSpace($args[1])) {
  $args[1]
} elseif ($env:HEAD_SHA) {
  $env:HEAD_SHA
} else {
  'HEAD'
}

Write-Host "Base ref: $baseRef"
Write-Host "Head ref: $headRef"

$null = git rev-parse --verify $baseRef 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Erro: base ref inválida ou ausente: $baseRef"
  Write-Host "Dica: rode 'git fetch origin main' e tente novamente."
  exit 1
}

$null = git rev-parse --verify $headRef 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Erro: head ref inválida ou ausente: $headRef"
  exit 1
}

$changedFiles = git diff --name-only $baseRef $headRef
if ($LASTEXITCODE -ne 0) {
  Write-Host "Erro ao calcular diff entre $baseRef e $headRef."
  exit 1
}

if ([string]::IsNullOrWhiteSpace($changedFiles)) {
  Write-Host 'Sem arquivos alterados no intervalo informado. Check aprovado.'
  exit 0
}

$requiresBump = $false
foreach ($line in ($changedFiles -split "`r?`n")) {
  if ($line -match '^(src/|tests/)') {
    $requiresBump = $true
    break
  }
}

if (-not $requiresBump) {
  Write-Host 'Sem alterações em src/ ou tests/'
  Write-Host 'Check aprovado sem exigir bump'
  exit 0
}

Write-Host 'Alterações detectadas em src/ ou tests/'
Write-Host 'Bump de versão exigido'
Write-Host ''

function Get-VersionFromRef {
  param(
    [Parameter(Mandatory = $true)][string]$Ref,
    [Parameter(Mandatory = $true)][string]$File
  )

  $raw = git show "$Ref`:$File" 2>$null
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($raw)) {
    return ''
  }

  try {
    $json = $raw | ConvertFrom-Json
  } catch {
    return ''
  }

  if ($File -eq 'app.json') {
    if ($null -ne $json.expo -and $json.expo.version) {
      return [string]$json.expo.version
    }
    if ($json.version) {
      return [string]$json.version
    }
    return ''
  }

  if ($json.version) {
    return [string]$json.version
  }

  return ''
}

$basePackageVersion = Get-VersionFromRef -Ref $baseRef -File 'package.json'
$headPackageVersion = Get-VersionFromRef -Ref $headRef -File 'package.json'
$baseAppVersion = Get-VersionFromRef -Ref $baseRef -File 'app.json'
$headAppVersion = Get-VersionFromRef -Ref $headRef -File 'app.json'

Write-Host "Versão base package.json: $basePackageVersion"
Write-Host "Versão head package.json: $headPackageVersion"
Write-Host "Versão base app.json: $baseAppVersion"
Write-Host "Versão head app.json: $headAppVersion"

if ([string]::IsNullOrWhiteSpace($headPackageVersion) -or [string]::IsNullOrWhiteSpace($headAppVersion)) {
  Write-Host 'Erro: não foi possível ler versão em package.json e/ou app.json do head.'
  exit 1
}

if ($headPackageVersion -ne $headAppVersion) {
  Write-Host "Erro: versões divergentes entre package.json ($headPackageVersion) e app.json ($headAppVersion)."
  exit 1
}

if ($basePackageVersion -eq $headPackageVersion -and $baseAppVersion -eq $headAppVersion) {
  Write-Host 'Erro: houve alteração em src/ ou tests/, mas sem bump de versão.'
  Write-Host 'Atualize package.json e app.json (campo version) antes do merge.'
  exit 1
}

Write-Host 'Bump de versão detectado e consistente. Check aprovado.'
