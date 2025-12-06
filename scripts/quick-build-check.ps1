# Quick Build Check Script
$results = @()
$ErrorActionPreference = "Continue"

Write-Host "`n=== Quick Build Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check infrastructure
Write-Host "Checking infrastructure package..." -ForegroundColor Yellow
try {
    Push-Location "packages/infrastructure"
    pnpm type-check 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Infrastructure type-check passed" -ForegroundColor Green
        $results += "Infrastructure: OK"
    } else {
        Write-Host "[FAIL] Infrastructure type-check failed" -ForegroundColor Red
        $results += "Infrastructure: FAIL"
    }
} catch {
    Write-Host "[FAIL] Infrastructure check error: $_" -ForegroundColor Red
    $results += "Infrastructure: ERROR"
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Checking app builds..." -ForegroundColor Yellow

$apps = @("ittweb", "personalpage", "MafaldaGarcia", "templatepage")

foreach ($app in $apps) {
    Write-Host "Checking $app..." -ForegroundColor Yellow
    try {
        $appPath = "apps/$app"
        if (Test-Path "$appPath/.next") {
            Write-Host "[OK] $app has build artifacts (.next exists)" -ForegroundColor Green
            $results += "$app`: OK (has .next)"
        } else {
            Write-Host "[INFO] $app - no .next directory (may not be built yet)" -ForegroundColor Gray
            $results += "$app`: NO BUILD"
        }
    } catch {
        Write-Host "[ERROR] $app - $($_.Exception.Message)" -ForegroundColor Red
        $results += "$app`: ERROR"
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
foreach ($result in $results) {
    if ($result -match "OK") {
        Write-Host "  $result" -ForegroundColor Green
    } elseif ($result -match "FAIL|ERROR") {
        Write-Host "  $result" -ForegroundColor Red
    } else {
        Write-Host "  $result" -ForegroundColor Gray
    }
}

Write-Host ""
