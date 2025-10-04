Write-Host "Cleaning up old dependencies..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "Removed package-lock.json" -ForegroundColor Green
}

Write-Host "Installing fresh dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Dependencies installed successfully!" -ForegroundColor Green