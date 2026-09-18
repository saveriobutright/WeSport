$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot
$dockerDir = Join-Path $rootDir "docker"
$backendDir = Join-Path $rootDir "backend\wesport-backend"
$frontendDir = Join-Path $rootDir "frontend"

Write-Host "Starting WeSport infrastructure..." -ForegroundColor Cyan

try {
    docker info *> $null
}
catch {
    Write-Host "Docker is not running. Start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

Push-Location $dockerDir

try {
    docker compose up -d
}
finally {
    Pop-Location
}

Write-Host "Starting backend..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "Set-Location -LiteralPath '$backendDir'; .\mvnw.cmd spring-boot:run"

Write-Host "Starting frontend..." -ForegroundColor Cyan

if (Test-Path (Join-Path $frontendDir "node_modules")) {
    $frontendCommand = "npm start"
}
else {
    $frontendCommand = "npm install; npm start"
}

Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "Set-Location -LiteralPath '$frontendDir'; $frontendCommand"

Write-Host ""
Write-Host "WeSport services are starting:" -ForegroundColor Green
Write-Host "Keycloak: http://localhost:8080"
Write-Host "Backend:  http://localhost:8081"
Write-Host "Frontend: http://localhost:4200"