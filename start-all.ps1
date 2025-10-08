# --- start-all.ps1 ---
$ErrorActionPreference = 'Stop'
function Write-Info($m){ Write-Host $m -ForegroundColor Cyan }
function Write-Ok($m){ Write-Host $m -ForegroundColor Green }
function Write-Warn($m){ Write-Host $m -ForegroundColor Yellow }
function Write-Err($m){ Write-Host $m -ForegroundColor Red }

# 0) Percorsi
$ROOT        = "C:\Users\saver\wesport"
$KC_DATA     = Join-Path $ROOT "docker\kc-data"
$BACKEND_DIR = Join-Path $ROOT "backend\wesport-backend"
$FRONTEND_DIR= Join-Path $ROOT "frontend"

Write-Info "KC_DATA = $KC_DATA"
New-Item -ItemType Directory -Force -Path $KC_DATA | Out-Null

# 1) Docker Desktop pronto?
function Wait-Docker {
  for($i=1;$i -le 60;$i++){
    try { docker info *> $null; return $true } catch { Start-Sleep -Seconds 2 }
  }
  return $false
}

try { docker info *> $null } catch {
  Write-Warn "Docker non sembra avviato. Avvio Docker Desktop..."
  $dockerExe = "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
  if(-not (Test-Path $dockerExe)){
    Write-Err "Docker Desktop non trovato in $dockerExe. Avvialo manualmente e riprova."
    exit 1
  }
  Start-Process -FilePath $dockerExe | Out-Null
  if(-not (Wait-Docker)){
    Write-Err "Docker non è diventato pronto. Apri Docker Desktop e riprova."
    exit 1
  }
}

# 2) Keycloak container
Write-Info "Avvio Keycloak su http://localhost:8080 ..."
$kcName = "keycloak"
$exists = (docker ps -a --filter "name=^/$kcName$" --format "{{.Names}}")
if($exists -eq $kcName){
  $running = (docker inspect -f "{{.State.Running}}" $kcName).Trim()
  if($running -eq "true"){
    Write-Ok "Keycloak già in esecuzione."
  } else {
    Write-Info "Keycloak esiste ma è fermo. Avvio..."
    docker start $kcName | Out-Null
  }
} else {
  Write-Info "Creo il container Keycloak..."
  docker run -d --name $kcName -p 8080:8080 `
    -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin `
    -v "${KC_DATA}:/opt/keycloak/data" `
    quay.io/keycloak/keycloak:24.0.5 start-dev | Out-Null
}

# 2b) Health-check Keycloak
function Wait-Url($url,$sec){
  $deadline = (Get-Date).AddSeconds($sec)
  while((Get-Date) -lt $deadline){
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
      if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){ return $true }
    } catch { }
    Start-Sleep -Milliseconds 800
  }
  return $false
}
if(Wait-Url "http://localhost:8080" 60){
  Write-Ok "Keycloak pronto."
} else {
  Write-Warn "Keycloak non risponde su 8080. Esegui 'docker logs -f keycloak' per dettagli."
}

# 3) PostgreSQL
Write-Info "Verifico servizi PostgreSQL..."
$pg = Get-Service | Where-Object { $_.Name -match "postgresql.*15" -or $_.Name -like "postgresql-x64-15" } | Select-Object -First 1
if($pg){
  if($pg.Status -ne 'Running'){ Start-Service $pg.Name }
  Write-Ok "PostgreSQL in esecuzione: $($pg.Name)"
} else {
  Write-Warn "Servizio PostgreSQL 15 non trovato. Assicurati che il DB sia avviato su 5432."
}

# 4) Backend
Write-Info "Avvio backend..."
Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$BACKEND_DIR`"; .\mvnw.cmd spring-boot:run"

# 5) Frontend (niente operatore ternario in PS5)
Write-Info "Avvio frontend..."
$hasNodeModules = Test-Path (Join-Path $FRONTEND_DIR "node_modules")
if($hasNodeModules){
  Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$FRONTEND_DIR`"; npm start"
} else {
  Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$FRONTEND_DIR`"; npm install; npm start"
}

Write-Ok "Tutto avviato. Keycloak: http://localhost:8080  | Backend: http://localhost:8081 | Frontend: http://localhost:4200"
