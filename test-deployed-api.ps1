# E-Social Bot API - Deployed API Test Script
# Deploy edildikdən sonra aşağıdakı URL-i dəyişdirin

# ⚠️ BU URL-İ ÖZ DEPLOYED API URL-İNİZLƏ DƏYİŞDİRİN
$API_URL = "https://e-social-bot-api.onrender.com"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║     E-SOCIAL BOT API - DEPLOYED API TEST SUITE       ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host "`nAPI URL: $API_URL`n" -ForegroundColor Yellow

# 1. Health Check
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 1: Health Check" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/health" -Method GET
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Scrape Data - Real Test
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 2: Scrape Data (Real FIN & SV)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$body1 = @{
    fin = "7EMHZ9L"
    sv = "AA3748461"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/scrape" -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

# 3. Scrape Data - With AZE Prefix
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 3: Scrape Data (AZE Prefix Test)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$body2 = @{
    fin = "7EMHZ9L"
    sv = "AZE3748461"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/scrape" -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

# 4. Error Test - Missing FIN
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 4: Error Handling (Missing FIN)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$body3 = @{
    sv = "AA3748461"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/scrape" -Method POST -Body $body3 -ContentType "application/json"
    Write-Host "⚠️ UNEXPECTED SUCCESS (Should have failed)" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✅ EXPECTED ERROR" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Message: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

# 5. Error Test - Missing SV
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 5: Error Handling (Missing SV)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$body4 = @{
    fin = "7EMHZ9L"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/scrape" -Method POST -Body $body4 -ContentType "application/json"
    Write-Host "⚠️ UNEXPECTED SUCCESS (Should have failed)" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✅ EXPECTED ERROR" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Message: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

# 6. Performance Test
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 6: Performance Test (Response Time)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/health" -Method GET
    $stopwatch.Stop()
    Write-Host "✅ Response Time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
} catch {
    $stopwatch.Stop()
    Write-Host "❌ FAILED after $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Red
}

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║              ALL TESTS COMPLETED                      ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

Write-Host "`n📝 Notes:" -ForegroundColor Yellow
Write-Host "   - First request may be slow (cold start)" -ForegroundColor Gray
Write-Host "   - Login required errors are normal for production" -ForegroundColor Gray
Write-Host "   - Update API_URL variable at the top of this script" -ForegroundColor Gray
