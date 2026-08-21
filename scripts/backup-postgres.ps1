param([string]$OutputDirectory = "./backups")
$ErrorActionPreference = 'Stop'
foreach ($name in @('DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USERNAME', 'DB_PASSWORD')) {
    if (-not (Get-Item "Env:$name" -ErrorAction SilentlyContinue)) { throw "Falta la variable de entorno $name." }
}
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$destination = Join-Path $OutputDirectory "$($env:DB_NAME)-$stamp.sql.gz"
$env:PGPASSWORD = $env:DB_PASSWORD
& pg_dump --host $env:DB_HOST --port $env:DB_PORT --username $env:DB_USERNAME --format=plain --no-owner --no-privileges $env:DB_NAME | gzip.exe > $destination
if ($LASTEXITCODE -ne 0) { throw "pg_dump falló." }
Write-Output "Backup creado en $destination"
