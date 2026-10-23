$ErrorActionPreference = "Stop"
Get-ChildItem -Recurse -Path js -Filter *.js | ForEach-Object {
  node --check $_.FullName; if ($LASTEXITCODE) { throw "Sintaxis: $($_.Name)" } }
gitleaks detect --no-banner; if ($LASTEXITCODE) { throw "Posible secreto" }
# -CaseSensitive y \b: sin eso "todos" coincide con TODO. Mensajes sin tildes: PowerShell 5.1 lee este archivo como ANSI.
$pend = Get-ChildItem -Recurse -Path js -Filter *.js | Select-String -CaseSensitive -Pattern "\b(TODO|FIXME)\b"
if ($pend) { $pend; throw "Pendientes en codigo" }
Write-Host "verificar: OK"
