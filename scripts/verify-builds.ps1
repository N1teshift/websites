# Build Verification Script
# Builds all packages and apps, reports success/failure

$ErrorActionPreference = "Continue"
$startTime = Get-Date
$results = @()

# Set up paths
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Join-Path $scriptRoot ".."
$logPath = Join-Path $repoRoot "build-verification.log"
$jsonPath = Join-Path $repoRoot "build-results.json"

# Clear previous log
if (Test-Path $logPath) { Remove-Item $logPath }

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Add-Content -Path $logPath -Value $logMessage -Encoding UTF8
    Write-Host $Message -ForegroundColor $Color
}

Write-Log "`n=== Build Verification Script ===" "Cyan"
Write-Log "Starting at: $startTime`n" "Gray"

# Function to run a build command and track results
function Test-Build {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command
    )
    
    Write-Log "Building $Name..." "Yellow"
    $buildStart = Get-Date
    
    $fullPath = Join-Path $repoRoot $Path
    
    if (-not (Test-Path $fullPath)) {
        $duration = (Get-Date) - $buildStart
        Write-Log "[FAIL] $Name - Path not found: $fullPath" "Red"
        return @{
            Name = $Name
            Success = $false
            Duration = $duration
            Output = "Path not found: $fullPath"
        }
    }
    
    Push-Location $fullPath
    try {
        # Check if pnpm is available
        $pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
        if (-not $pnpmCmd) {
            throw "pnpm command not found. Please ensure pnpm is installed and in your PATH."
        }
        
        # Use PowerShell call operator & to invoke pnpm
        # Split command into parts for proper argument handling
        $cmdParts = $Command -split '\s+'
        $output = & pnpm $cmdParts 2>&1 | Out-String
        $exitCode = $LASTEXITCODE
        $success = $exitCode -eq 0
        $duration = (Get-Date) - $buildStart
        
        if ($success) {
            Write-Log "[OK] $Name - SUCCESS ($($duration.ToString('mm\:ss')))" "Green"
        } else {
            Write-Log "[FAIL] $Name - FAILED ($($duration.ToString('mm\:ss'))) - Exit Code: $exitCode" "Red"
            if ($output) {
                $errorPreview = ($output -split "`n") | Where-Object { $_.Trim() -ne "" } | Select-Object -First 10
                Write-Log "First 10 lines of output:" "Red"
                foreach ($line in $errorPreview) {
                    Write-Log "  $line" "DarkRed"
                }
            }
        }
        
        return @{
            Name = $Name
            Success = $success
            Duration = $duration
            Output = $output
            ExitCode = $exitCode
        }
    } catch {
        $duration = (Get-Date) - $buildStart
        $errorMsg = $_.Exception.Message
        Write-Log "[FAIL] $Name - ERROR: $errorMsg ($($duration.ToString('mm\:ss')))" "Red"
        return @{
            Name = $Name
            Success = $false
            Duration = $duration
            Output = $errorMsg
            ExitCode = -1
        }
    } finally {
        Pop-Location
    }
}

# Step 1: Build infrastructure package (type-check first)
Write-Log "`n--- Step 1: Infrastructure Package ---" "Cyan"
$results += Test-Build -Name "Infrastructure (type-check)" -Path "packages/infrastructure" -Command "type-check"

# Step 2: Build all apps
Write-Log "`n--- Step 2: Building Apps ---" "Cyan"
$results += Test-Build -Name "ittweb" -Path "apps/ittweb" -Command "build"
$results += Test-Build -Name "personalpage" -Path "apps/personalpage" -Command "build"
$results += Test-Build -Name "MafaldaGarcia" -Path "apps/MafaldaGarcia" -Command "build"
$results += Test-Build -Name "templatepage" -Path "apps/templatepage" -Command "build"

# Summary
$endTime = Get-Date
$totalDuration = $endTime - $startTime
$successCount = ($results | Where-Object { $_.Success }).Count
$failCount = ($results | Where-Object { -not $_.Success }).Count

Write-Log "`n=== Build Summary ===" "Cyan"
Write-Log "Total Duration: $($totalDuration.ToString('mm\:ss'))" "Gray"
Write-Log "Successful: $successCount / $($results.Count)" $(if ($failCount -eq 0) { "Green" } else { "Yellow" })
Write-Log "Failed: $failCount / $($results.Count)" $(if ($failCount -eq 0) { "Green" } else { "Red" })

Write-Log "`nDetailed Results:" "Cyan"
foreach ($result in $results) {
    $status = if ($result.Success) { "[OK]" } else { "[FAIL]" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    $durationStr = "{0:mm\:ss}" -f $result.Duration
    Write-Log "  $status $($result.Name) - $durationStr" $color
}

# Write results to JSON file
$jsonResult = @{
    StartTime = $startTime.ToString("o")
    EndTime = $endTime.ToString("o")
    TotalDurationSeconds = $totalDuration.TotalSeconds
    TotalDurationFormatted = $totalDuration.ToString('mm\:ss')
    SuccessCount = $successCount
    FailCount = $failCount
    TotalCount = $results.Count
    AllSuccessful = ($failCount -eq 0)
    Results = $results | ForEach-Object {
        @{
            Name = $_.Name
            Success = $_.Success
            DurationSeconds = $_.Duration.TotalSeconds
            DurationFormatted = $_.Duration.ToString('mm\:ss')
            ExitCode = $_.ExitCode
            Output = ($_.Output -split "`n" | Select-Object -First 50) -join "`n"
        }
    }
}

$jsonResult | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
Write-Log "`nResults saved to: $jsonPath" "Gray"
Write-Log "Full log saved to: $logPath" "Gray"

if ($failCount -gt 0) {
    Write-Log "`nFailed Builds:" "Red"
    foreach ($result in ($results | Where-Object { -not $_.Success })) {
        Write-Log "`n  $($result.Name) (Exit Code: $($result.ExitCode)):" "Red"
        if ($result.Output) {
            $errorLines = ($result.Output -split "`n") | Where-Object { $_.Trim() -ne "" } | Select-Object -First 20
            foreach ($line in $errorLines) {
                Write-Log "    $line" "DarkRed"
            }
        }
    }
    Write-Log "`nSee full log at: $logPath" "Yellow"
    exit 1
} else {
    Write-Log "`n[OK] All builds completed successfully!" "Green"
    exit 0
}
