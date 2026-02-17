# 🚀 E-Social Bot API - Deployment Guide

## ⚠️ ÖNƏMLİ QEYD

Puppeteer serverless platformlarda (Vercel, Netlify) **IŞLƏMƏZ** çünki Chrome binary tələb edir. 
Bu API **Render.com** üçün optimallaşdırılıb.

---

## 🎯 Tövsiyə Olunan Platform: Render.com

### Niyə Render?
- ✅ **Pulsuz tier** (750 saat/ay)
- ✅ **Puppeteer dəstəyi** (Native Chrome)
- ✅ **Asan deployment** (GitHub integration)
- ✅ **Avtomatik HTTPS**
- ✅ **Auto-deploy** (Git push = auto deploy)
- ✅ **Persistent disk** (Session saxlanması)

### Render Deployment Addımları:

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

2. **Render.com-a Qeydiyyat**
   - [render.com](https://render.com) saytına daxil olun
   - "Get Started" düyməsinə basın
   - GitHub ilə giriş edin

3. **Yeni Web Service Yaradın**
   - Dashboard-da "New +" → "Web Service"
   - GitHub repository-ni connect edin
   - `e-social-bot-api` repository-ni seçin

4. **Deployment Settings**
   - **Name**: `e-social-bot-api`
   - **Environment**: `Node`
   - **Region**: `Frankfurt (EU Central)` (Azərbaycana ən yaxın)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

5. **Advanced Settings (Optional)**
   - Environment Variables: Lazım deyil
   - Auto-Deploy: `Yes` (default)

6. **Deploy Edin**
   - "Create Web Service" düyməsinə basın
   - İlk deployment 5-10 dəqiqə çəkir (Puppeteer install edir)
   - Logs-da "Server running" görünənə qədər gözləyin

7. **Domain Əldə Edin**
   - Deployment bitdikdən sonra URL avtomatik yaranır
   - Nümunə: `https://e-social-bot-api.onrender.com`
   - Settings-dən custom domain əlavə edə bilərsiniz

---

## 🧪 Deployed API Test Komandaları

### Render URL ilə
```bash
# Health Check
curl https://e-social-bot-api.onrender.com/api/health

# Scrape Data
curl -X POST https://e-social-bot-api.onrender.com/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"7EMHZ9L\",\"sv\":\"AA3748461\"}"
```

### PowerShell (Windows)
```powershell
# Health Check
Invoke-RestMethod -Uri "https://e-social-bot-api.onrender.com/api/health"

# Scrape Data
$body = @{ fin = "7EMHZ9L"; sv = "AA3748461" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://e-social-bot-api.onrender.com/api/scrape" `
  -Method POST -Body $body -ContentType "application/json"
```

---

## 🔧 PowerShell Test Script (Windows)

Deploy edildikdən sonra, `test-deployed-api.ps1` faylını işlədin:

```powershell
# Faylı redaktə edin və API URL-i dəyişdirin
$API_URL = "https://e-social-bot-api.onrender.com"

# Scripti işə salın
.\test-deployed-api.ps1
```

---

## 📱 Başqa Proyektlərdə İstifadə

### JavaScript/Node.js
```javascript
const response = await fetch('https://e-social-bot-api.onrender.com/api/scrape', {
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
