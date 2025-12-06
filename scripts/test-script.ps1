# Simple test script to verify execution works
$testFile = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) ".." "test-execution.txt"
"Script executed at: $(Get-Date)" | Out-File -FilePath $testFile -Encoding UTF8
Write-Host "Test file created at: $testFile"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Script path: $($MyInvocation.MyCommand.Path)"





