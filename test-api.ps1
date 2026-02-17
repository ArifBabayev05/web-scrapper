# Windows PowerShell Test Commands

# 1. Health Check
Write-Host "`n=== 1. Health Check ===" -ForegroundColor Cyan
curl http://localhost:3000/api/health

# 2. Scrape Data - Example 1
Write-Host "`n`n=== 2. Scrape Data - Example 1 ===" -ForegroundColor Cyan
$body1 = @{
    fin = "7EMHZ9L"
    sv = "AA3748461"
} | ConvertTo-Json

curl -Method POST `
  -Uri http://localhost:3000/api/scrape `
  -ContentType "application/json" `
  -Body $body1

# 3. Scrape Data - Example 2 (with AZE prefix)
Write-Host "`n`n=== 3. Scrape Data - Example 2 (AZE prefix) ===" -ForegroundColor Cyan
$body2 = @{
    fin = "5ABC123"
    sv = "AZE1234567"
} | ConvertTo-Json

curl -Method POST `
  -Uri http://localhost:3000/api/scrape `
  -ContentType "application/json" `
  -Body $body2

# 4. Test Error - Missing FIN
Write-Host "`n`n=== 4. Test Error - Missing FIN ===" -ForegroundColor Cyan
$body3 = @{
    sv = "AA3748461"
} | ConvertTo-Json

curl -Method POST `
  -Uri http://localhost:3000/api/scrape `
  -ContentType "application/json" `
  -Body $body3

# 5. Test Error - Missing SV
Write-Host "`n`n=== 5. Test Error - Missing SV ===" -ForegroundColor Cyan
$body4 = @{
    fin = "7EMHZ9L"
} | ConvertTo-Json

curl -Method POST `
  -Uri http://localhost:3000/api/scrape `
  -ContentType "application/json" `
  -Body $body4

Write-Host "`n`n=== Tests Completed ===" -ForegroundColor Green
