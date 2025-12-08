# Dependency Analysis Script (PowerShell)
# 
# Analyzes dependencies across the monorepo to identify:
# - Duplicate dependencies that could be consolidated
# - Dependencies that should be in shared packages
# - Version mismatches

$ErrorActionPreference = "Stop"

$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$APPS_DIR = Join-Path $ROOT_DIR "apps"
$PACKAGES_DIR = Join-Path $ROOT_DIR "packages"

# Known shared dependencies
$SHARED_DEPS = @{
    infrastructure = @('axios', 'zod')
    ui = @('framer-motion', 'lucide-react', 'nprogress', 'react-icons')
}

function Read-PackageJson {
    param([string]$Dir)
    
    $packagePath = Join-Path $Dir "package.json"
    if (-not (Test-Path $packagePath)) {
        return $null
    }
    
    try {
        $content = Get-Content $packagePath -Raw
        return $content | ConvertFrom-Json
    } catch {
        Write-Warning "Failed to read $packagePath : $($_.Exception.Message)"
        return $null
    }
}

function Get-AllDependencies {
    param($Pkg)
    
    $deps = @{}
    if ($Pkg.dependencies) {
        $Pkg.dependencies.PSObject.Properties | ForEach-Object {
            $deps[$_.Name] = $_.Value
        }
    }
    if ($Pkg.devDependencies) {
        $Pkg.devDependencies.PSObject.Properties | ForEach-Object {
            $deps[$_.Name] = $_.Value
        }
    }
    return $deps
}

Write-Host "🔍 Analyzing dependencies across monorepo...`n" -ForegroundColor Cyan

# Read all package.json files
$packages = @{}
$apps = @{}

# Read packages
$packageDirs = Get-ChildItem $PACKAGES_DIR -Directory
foreach ($dir in $packageDirs) {
    $pkg = Read-PackageJson $dir.FullName
    if ($pkg) {
        $packages[$dir.Name] = @{
            name = $pkg.name
            deps = Get-AllDependencies $pkg
            path = $dir.FullName
        }
    }
}

# Read apps
$appDirs = Get-ChildItem $APPS_DIR -Directory
foreach ($dir in $appDirs) {
    $pkg = Read-PackageJson $dir.FullName
    if ($pkg) {
        $apps[$dir.Name] = @{
            name = $pkg.name
            deps = Get-AllDependencies $pkg
            path = $dir.FullName
        }
    }
}

# Find dependencies that should be in shared packages
Write-Host "⚠️  Dependencies that should be in shared packages:`n" -ForegroundColor Yellow
$hasIssues = $false

foreach ($appName in $apps.Keys) {
    $app = $apps[$appName]
    $issues = @()
    
    foreach ($dep in $app.deps.Keys) {
        $version = $app.deps[$dep]
        
        # Check if dependency should be in infrastructure
        if ($SHARED_DEPS.infrastructure -contains $dep) {
            $issues += @{
                dep = $dep
                version = $version
                shouldBeIn = 'infrastructure'
                currentLocation = 'app'
            }
            $hasIssues = $true
        }
        
        # Check if dependency should be in ui
        if ($SHARED_DEPS.ui -contains $dep) {
            $issues += @{
                dep = $dep
                version = $version
                shouldBeIn = 'ui'
                currentLocation = 'app'
            }
            $hasIssues = $true
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-Host "  $appName :" -ForegroundColor Yellow
        foreach ($issue in $issues) {
            Write-Host "    - $($issue.dep)@$($issue.version) should be in @websites/$($issue.shouldBeIn)"
        }
        Write-Host ""
    }
}

# Find version mismatches
Write-Host "🔀 Version Mismatches:`n" -ForegroundColor Cyan
$allDeps = @{}
$versionMap = @{}

# Collect all dependencies
foreach ($appName in $apps.Keys) {
    $app = $apps[$appName]
    foreach ($dep in $app.deps.Keys) {
        $version = $app.deps[$dep]
        if (-not $allDeps.ContainsKey($dep)) {
            $allDeps[$dep] = @()
        }
        $allDeps[$dep] += @{
            type = 'app'
            name = $appName
            version = $version
        }
    }
}

# Find mismatches
foreach ($dep in $allDeps.Keys) {
    $versions = $allDeps[$dep] | Select-Object -ExpandProperty version -Unique
    if ($versions.Count -gt 1) {
        $versionMap[$dep] = @{
            versions = $versions
            locations = $allDeps[$dep]
        }
    }
}

if ($versionMap.Count -gt 0) {
    foreach ($dep in $versionMap.Keys) {
        $info = $versionMap[$dep]
        Write-Host "  $dep :" -ForegroundColor Yellow
        Write-Host "    Versions: $($info.versions -join ', ')"
        foreach ($loc in $info.locations) {
            Write-Host "      - $($loc.type)/$($loc.name): $($loc.version)"
        }
        Write-Host ""
    }
} else {
    Write-Host "  ✅ No version mismatches found`n" -ForegroundColor Green
}

# Summary
Write-Host "📊 Summary:`n" -ForegroundColor Cyan
Write-Host "  Total apps: $($apps.Count)"
Write-Host "  Total packages: $($packages.Count)"
Write-Host "  Unique dependencies: $($allDeps.Count)"
Write-Host "  Version mismatches: $($versionMap.Count)"

if ($hasIssues) {
    Write-Host "`n⚠️  Action required: Some dependencies should be moved to shared packages" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n✅ No dependency consolidation issues found" -ForegroundColor Green
    exit 0
}
