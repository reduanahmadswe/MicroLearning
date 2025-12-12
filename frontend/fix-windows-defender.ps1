# Fix Next.js EPERM errors on Windows by excluding .next folder from Windows Defender
# Run this script as Administrator

Write-Host "Adding Windows Defender exclusions for Next.js development..." -ForegroundColor Cyan

$nextPath = Join-Path $PSScriptRoot ".next"

try {
    # Add .next folder to Windows Defender exclusions
    Add-MpPreference -ExclusionPath $nextPath
    Write-Host "✓ Successfully added exclusion: $nextPath" -ForegroundColor Green
    
    # Also exclude node_modules if not already excluded
    $nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
    Add-MpPreference -ExclusionPath $nodeModulesPath
    Write-Host "✓ Successfully added exclusion: $nodeModulesPath" -ForegroundColor Green
    
    Write-Host "`nWindows Defender exclusions added successfully!" -ForegroundColor Green
    Write-Host "Please restart your Next.js development server." -ForegroundColor Yellow
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nNote: You must run this script as Administrator!" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
}

# Display current exclusions
Write-Host "`nCurrent Windows Defender Exclusions:" -ForegroundColor Cyan
Get-MpPreference | Select-Object -ExpandProperty ExclusionPath
