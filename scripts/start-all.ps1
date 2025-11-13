Param(
    [switch]$OpenBrowser
)

# Resolve repository root and service paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = $repoRoot

function Start-IfNotListening {
    param(
        [int]$Port,
        [string]$WorkingDirectory,
        [string]$Command,
        [string]$Name
    )

    $check = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    if ($check -and $check.TcpTestSucceeded) {
        Write-Host "$Name already listening on port $Port; skipping start." -ForegroundColor Yellow
        return
    }

    Write-Host "Starting $Name on port $Port..." -ForegroundColor Green
    # Start in a new PowerShell window and keep it open (-NoExit) so logs remain visible
    $escapedDir = $WorkingDirectory -replace "'","''"
    $fullCmd = "cd '$escapedDir'; $Command"
    Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command',$fullCmd
}

Write-Host "Repository root: $repoRoot" -ForegroundColor Cyan

# Start backend (port 3000)
Start-IfNotListening -Port 3000 -WorkingDirectory $backendDir -Command 'node server.js' -Name 'Backend (node)'

# Start frontend (Vite default port 5173)
Start-IfNotListening -Port 5173 -WorkingDirectory $frontendDir -Command 'npm run dev' -Name 'Frontend (Vite)'

if ($OpenBrowser) {
    Start-Sleep -Seconds 1
    Write-Host "Opening browser to http://localhost:5173" -ForegroundColor Cyan
    Start-Process 'http://localhost:5173'
}

Write-Host "Start script finished. Check the new terminal windows for logs." -ForegroundColor Green
