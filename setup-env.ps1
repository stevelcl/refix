# Quick Setup Script for .env file
# Run this script to create your .env file interactively

Write-Host "=== ReFix Environment Variables Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit
    }
}

Write-Host "Enter your backend API URL:" -ForegroundColor Green
Write-Host "Examples:" -ForegroundColor Gray
Write-Host "  - Local: http://localhost:3000/api" -ForegroundColor Gray
Write-Host "  - Azure Functions: https://your-app.azurewebsites.net/api" -ForegroundColor Gray
Write-Host ""

$apiBase = Read-Host "VITE_API_BASE"

if ([string]::IsNullOrWhiteSpace($apiBase)) {
    Write-Host "⚠️  No API URL provided. Using default: http://localhost:3000/api" -ForegroundColor Yellow
    $apiBase = "http://localhost:3000/api"
}

Write-Host ""
Write-Host "Azure Blob Storage SAS URL (optional - press Enter to skip):" -ForegroundColor Green
$blobUrl = Read-Host "VITE_BLOB_CONTAINER_SAS_URL"

# Create .env content
$envContent = "# Backend API Base URL (REQUIRED)`nVITE_API_BASE=$apiBase`n`n# Azure Blob Storage SAS URL (OPTIONAL)`nVITE_BLOB_CONTAINER_SAS_URL=$blobUrl"

# Write to .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Contents:" -ForegroundColor Cyan
Write-Host $envContent
Write-Host ""
Write-Host "⚠️  Don't forget to restart your dev server (npm run dev)" -ForegroundColor Yellow

