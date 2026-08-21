param([Parameter(Mandatory = $true)][string]$BackupFile)
$ErrorActionPreference = 'Stop'
foreach ($name in @('DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USERNAME', 'DB_PASSWORD')) {
    if (-not (Get-Item "Env:$name" -ErrorAction SilentlyContinue)) { throw "Falta la variable de entorno $name." }
}
if (-not (Test-Path -LiteralPath $BackupFile)) { throw "No existe el backup indicado." }
$env:PGPASSWORD = $env:DB_PASSWORD
Write-Warning "La restauración sobrescribirá el contenido de la base $($env:DB_NAME)."
if ((Read-Host 'Escribí RESTAURAR para continuar') -cne 'RESTAURAR') { throw 'Restauración cancelada.' }
& psql --host $env:DB_HOST --port $env:DB_PORT --username $env:DB_USERNAME --dbname $env:DB_NAME --set ON_ERROR_STOP=1 --file $BackupFile
if ($LASTEXITCODE -ne 0) { throw "psql falló." }
Write-Output "Backup restaurado correctamente."
