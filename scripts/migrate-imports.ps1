# Migration script to update imports from @/features/infrastructure to @websites/infrastructure
param(
    [string]$AppPath = "apps/ittweb"
)

$replacements = @{
    "@/features/infrastructure/logging" = "@websites/infrastructure/logging"
    "@/features/infrastructure/api" = "@websites/infrastructure/api"
    "@/features/infrastructure/utils" = "@websites/infrastructure/utils"
    "@/features/infrastructure/hooks" = "@websites/infrastructure/hooks"
    "@/features/infrastructure/monitoring" = "@websites/infrastructure/monitoring"
    "@/features/infrastructure/cache" = "@websites/infrastructure/cache"
    "@/features/infrastructure/firebase" = "@websites/infrastructure/firebase"
    "@/features/infrastructure/auth" = "@websites/infrastructure/auth"
    "@/features/infrastructure/i18n" = "@websites/infrastructure/i18n"
}

Write-Host "Migrating imports in $AppPath..." -ForegroundColor Cyan

Get-ChildItem -Path $AppPath/src -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $file = $_.FullName
    try {
        $content = Get-Content $file -Raw -ErrorAction Stop
    } catch {
        $content = (Get-Content $file) -join "`n"
    }
    
    $modified = $false
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $modified = $true
            Write-Host "  Updated $old -> $new in $($_.Name)" -ForegroundColor Yellow
        }
    }
    
    if ($modified) {
        Set-Content -Path $file -Value $content -NoNewline
    }
}

Write-Host "Migration complete!" -ForegroundColor Green


