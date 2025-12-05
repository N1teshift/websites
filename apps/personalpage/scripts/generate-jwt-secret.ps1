# Generate a random JWT secret
$bytes = New-Object byte[] 32
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Write-Host "JWT_SECRET=$secret" -ForegroundColor Green
Write-Host ""
Write-Host "Add this to your .env.local file:" -ForegroundColor Yellow
Write-Host "JWT_SECRET=$secret"

