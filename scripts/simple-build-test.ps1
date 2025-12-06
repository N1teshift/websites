# Simple build test that writes status immediately
$statusFile = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) ".." "build-status.txt"
$results = @()

function Test-Build {
    param($Name, $Path, $Command)
    
    $status = "Testing $Name..."
    Add-Content $statusFile $status
    Write-Host $status
    
    $start = Get-Date
    $fullPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) ".." $Path
    
    Push-Location $fullPath
    try {
        & pnpm $Command 2>&1 | Out-Null
        $success = $LASTEXITCODE -eq 0
        $duration = ((Get-Date) - $start).TotalSeconds
        
        $result = if ($success) { "PASS" } else { "FAIL" }
        $status = "$Name : $result ($([math]::Round($duration))s)"
        Add-Content $statusFile $status
        Write-Host $status
        
        return @{ Name = $Name; Success = $success; Duration = $duration }
    } catch {
        $status = "$Name : FAIL (Error: $_)"
        Add-Content $statusFile $status
        return @{ Name = $Name; Success = $false; Duration = 0 }
    } finally {
        Pop-Location
    }
}

# Clear status file
"" | Out-File $statusFile
Add-Content $statusFile "Build Test Started: $(Get-Date)"
Add-Content $statusFile ""

# Run tests
$results += Test-Build "Infrastructure" "packages/infrastructure" "type-check"
$results += Test-Build "ittweb" "apps/ittweb" "build"
$results += Test-Build "personalpage" "apps/personalpage" "build"
$results += Test-Build "MafaldaGarcia" "apps/MafaldaGarcia" "build"
$results += Test-Build "templatepage" "apps/templatepage" "build"

# Summary
Add-Content $statusFile ""
Add-Content $statusFile "=== SUMMARY ==="
$successCount = ($results | Where-Object { $_.Success }).Count
Add-Content $statusFile "Successful: $successCount / $($results.Count)"
Add-Content $statusFile "Completed: $(Get-Date)"






