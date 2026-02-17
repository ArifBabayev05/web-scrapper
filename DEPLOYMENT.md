# 🚀 E-Social Bot API - Deployment Guide

## ⚠️ ÖNƏMLİ QEYD

Puppeteer serverless platformlarda (Vercel, Netlify) **IŞLƏMƏZ** çünki Chrome binary tələb edir. 
Aşağıdakı platformlardan birini seçin:

---

## 🎯 Tövsiyə Olunan Platform: Railway.app

### Niyə Railway?
- ✅ Pulsuz tier (500 saat/ay)
- ✅ Puppeteer dəstəyi
- ✅ Asan deployment
- ✅ Avtomatik HTTPS
- ✅ Environment variables

### Railway Deployment Addımları:

1. **GitHub Repository Yaradın**
   ```bash
   cd c:\Users\arif.babayev\Desktop\e-social-bot
   git init
   git add .
   git commit -m "Initial commit: E-Social Bot API"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/e-social-bot-api.git
   git push -u origin main
   ```

2. **Railway.app-a Qeydiyyat**
   - [railway.app](https://railway.app) saytına daxil olun
   - GitHub ilə giriş edin

3. **Yeni Proyekt Yaradın**
   - "New Project" → "Deploy from GitHub repo"
   - `e-social-bot-api` repository-ni seçin
   - Railway avtomatik detect edəcək və deploy edəcək

4. **Environment Variables (Lazım deyil, amma istəsəniz)**
   - Settings → Variables
   - `PORT` əlavə etməyə ehtiyac yoxdur (Railway avtomatik təyin edir)

5. **Domain Əldə Edin**
   - Settings → Networking → Generate Domain
   - Nümunə: `https://e-social-bot-api-production.up.railway.app`

---

## 🔄 Alternativ: Render.com

### Render Deployment:

1. **GitHub-a Push Edin** (yuxarıdakı kimi)

2. **Render.com-a Qeydiyyat**
   - [render.com](https://render.com) saytına daxil olun
   - GitHub ilə giriş edin

3. **Yeni Web Service Yaradın**
   - "New" → "Web Service"
   - Repository seçin: `e-social-bot-api`
   - Settings:
     - **Name**: e-social-bot-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Plan**: Free

4. **Deploy Edin**
   - "Create Web Service" düyməsinə basın
   - 5-10 dəqiqə gözləyin
   - Domain: `https://e-social-bot-api.onrender.com`

---

## 🧪 Deployed API Test Komandaları

### Railway URL ilə (Nümunə)
```bash
# Health Check
curl https://e-social-bot-api-production.up.railway.app/api/health

# Scrape Data
curl -X POST https://e-social-bot-api-production.up.railway.app/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"7EMHZ9L\",\"sv\":\"AA3748461\"}"
```

### Render URL ilə (Nümunə)
```bash
# Health Check
curl https://e-social-bot-api.onrender.com/api/health

# Scrape Data
curl -X POST https://e-social-bot-api.onrender.com/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"7EMHZ9L\",\"sv\":\"AA3748461\"}"
```

---

## 🔧 PowerShell Test Script (Windows)

Deploy edildikdən sonra, `test-deployed-api.ps1` faylını yaradın:

```powershell
# Deployed API URL-ni dəyişdirin
$API_URL = "https://e-social-bot-api-production.up.railway.app"

# Health Check
Write-Host "`n=== Health Check ===" -ForegroundColor Cyan
curl "$API_URL/api/health"

# Scrape Data
Write-Host "`n`n=== Scrape Data ===" -ForegroundColor Cyan
$body = @{
    fin = "7EMHZ9L"
    sv = "AA3748461"
} | ConvertTo-Json

curl -Method POST `
  -Uri "$API_URL/api/scrape" `
  -ContentType "application/json" `
  -Body $body
```

---

## 📱 Başqa Proyektlərdə İstifadə

### JavaScript/Node.js
```javascript
const response = await fetch('https://YOUR-API-URL/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fin: '7EMHZ9L', sv: 'AA3748461' })
});
const data = await response.json();
console.log(data);
```

### Python
```python
import requests

url = "https://YOUR-API-URL/api/scrape"
payload = {"fin": "7EMHZ9L", "sv": "AA3748461"}
response = requests.post(url, json=payload)
print(response.json())
```

### PHP
```php
$url = "https://YOUR-API-URL/api/scrape";
$data = json_encode(["fin" => "7EMHZ9L", "sv" => "AA3748461"]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

echo $result;
```

### C# (.NET)
```csharp
using System.Net.Http;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
var payload = new { fin = "7EMHZ9L", sv = "AA3748461" };
var json = JsonSerializer.Serialize(payload);
var content = new StringContent(json, Encoding.UTF8, "application/json");

var response = await client.PostAsync("https://YOUR-API-URL/api/scrape", content);
var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);
```

---

## 🐛 Troubleshooting

### Problem: "Puppeteer failed to launch"
**Həll**: Railway/Render avtomatik Chrome binary quraşdırır. Əgər problem olarsa, `package.json`-a əlavə edin:
```json
"dependencies": {
  "puppeteer": "^24.15.0",
  "chrome-aws-lambda": "^10.1.0"
}
```

### Problem: "Timeout error"
**Həll**: Free tier-də cold start ola bilər (ilk request 30-60 saniyə çəkə bilər)

### Problem: "Login required"
**Həll**: Bu normal davranışdır. İstifadəçi local brauzerdə login olmalıdır. Production-da bu API yalnız artıq login olmuş session-larla işləyir.

---

## 📊 Monitoring

Railway/Render dashboard-da:
- Request logs
- Error tracking
- Performance metrics
- Uptime monitoring

---

## 💰 Qiymətləndirmə

| Platform | Pulsuz Tier | Aylıq Qiymət |
|----------|-------------|--------------|
| Railway  | 500 saat    | $5/ay (hobby) |
| Render   | 750 saat    | $7/ay (starter) |

---

## ✅ Deployment Checklist

- [ ] GitHub repository yaradıldı
- [ ] Code push edildi
- [ ] Railway/Render-də proyekt yaradıldı
- [ ] Deployment uğurlu oldu
- [ ] Health check test edildi
- [ ] Scrape endpoint test edildi
- [ ] API URL saxlanıldı
- [ ] Başqa proyektlərdə inteqrasiya edildi

---

## 🔐 Security Notes

1. **Rate Limiting**: Production-da rate limiting əlavə edin
2. **API Key**: Public API üçün authentication əlavə edin
3. **CORS**: Yalnız etibar edilən domainlərə icazə verin

---

## 📞 Support

Problem yaranarsa:
1. Railway/Render logs-a baxın
2. GitHub Issues yaradın
3. Documentation-ı yenidən oxuyun
