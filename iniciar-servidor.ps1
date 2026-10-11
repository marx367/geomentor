# Levanta un servidor local para abrir GeoMentor (los módulos ES no cargan con file://).
# Uso: .\iniciar-servidor.ps1   → abre http://localhost:8080

$puerto = 8080
Set-Location -Path $PSScriptRoot

# Preferimos Node (npx serve); si no está, probamos con Python.
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Start-Process "http://localhost:$puerto"
    npx --yes serve -l $puerto .
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Start-Process "http://localhost:$puerto"
    python -m http.server $puerto
}
else {
    # Mensaje sin tildes: PowerShell 5.1 lee los .ps1 sin BOM como ANSI y las rompería.
    Write-Host "No se encontro Node ni Python. Instala uno de los dos o usa Live Server en VS Code." -ForegroundColor Yellow
}
