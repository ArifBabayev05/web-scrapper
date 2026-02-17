# 📦 E-Social Bot API - Deployment Summary

## ✅ Hazır Fayllar

### 🔧 Core Files
- ✅ `server.js` - Express.js API server (Puppeteer ilə)
- ✅ `package.json` - Dependencies və scripts
- ✅ `.gitignore` - Git ignore rules
- ✅ `Procfile` - Process definition
- ✅ `render.yaml` - Render.com deployment config

### 📚 Documentation
- ✅ `README.md` - Əsas documentation
- ✅ `DEPLOYMENT.md` - Ətraflı deployment guide (Render.com)
- ✅ `QUICKSTART.md` - Sürətli başlanğıc guide
- ✅ `.env.example` - Environment variables nümunəsi

### 🧪 Test Files
- ✅ `test-deployed-api.ps1` - PowerShell test script (Windows)
- ✅ `test-deployed-api.sh` - Bash test script (Linux/Mac)
- ✅ `test-api.ps1` - Local development test script

---

## 🚀 Deployment Addımları (Render.com)

### 1. GitHub-a Push Edin
```bash
cd c:\Users\arif.babayev\Desktop\e-social-bot

# Git init (əgər hələ etməmisinizsə)
git init
git add .
git commit -m "Initial commit: E-Social Bot API"

# GitHub repository yaradın və push edin
git remote add origin https://github.com/YOUR_USERNAME/e-social-bot-api.git
git branch -M main
git push -u origin main
```

### 2. Render.com-da Deploy Edin
1. **Qeydiyyat**: https://render.com → "Get Started" → GitHub ilə giriş
2. **New Service**: "New +" → "Web Service"
3. **Repository Seçin**: `e-social-bot-api`
4. **Settings**:
   - Name: `e-social-bot-api`
   - Environment: `Node`
   - Region: `Frankfurt (EU Central)`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: `Free`
5. **Deploy**: "Create Web Service" → 5-10 dəqiqə gözləyin
6. **URL Əldə Edin**: `https://e-social-bot-api.onrender.com`

---

## 🧪 Test Etmək

### Option 1: PowerShell Script (Windows)
```powershell
# test-deployed-api.ps1 faylında API URL-i dəyişdirin
$API_URL = "https://YOUR-ACTUAL-URL.onrender.com"

# Scripti işə salın
.\test-deployed-api.ps1
```

### Option 2: Manual cURL Test
```bash
# Health Check
curl https://YOUR-API-URL.onrender.com/api/health

# Scrape Data
curl -X POST https://YOUR-API-URL.onrender.com/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"7EMHZ9L\",\"sv\":\"AA3748461\"}"
```

---

## 📱 Başqa Proyektlərdə İstifadə

### JavaScript/TypeScript
```javascript
const API_URL = 'https://e-social-bot-api.onrender.com/api/scrape';

async function getEmployeeData(fin, sv) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fin, sv })
  });
  return await response.json();
}

// İstifadə
const data = await getEmployeeData('7EMHZ9L', 'AA3748461');
console.log(data.data.fullName); // "MƏMMƏDOV ƏHMƏD HƏSƏN"
```

### Python
```python
import requests

API_URL = "https://e-social-bot-api.onrender.com/api/scrape"

def get_employee_data(fin, sv):
    response = requests.post(API_URL, json={"fin": fin, "sv": sv})
    return response.json()

# İstifadə
data = get_employee_data("7EMHZ9L", "AA3748461")
print(data['data']['fullName'])
```

### PHP
```php
<?php
$api_url = "https://e-social-bot-api.onrender.com/api/scrape";
$payload = json_encode(["fin" => "7EMHZ9L", "sv" => "AA3748461"]);

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

$data = json_decode($result, true);
echo $data['data']['fullName'];
?>
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

var response = await client.PostAsync(
    "https://e-social-bot-api.onrender.com/api/scrape", 
    content
);
var result = await response.Content.ReadAsStringAsync();
var data = JsonSerializer.Deserialize<dynamic>(result);
Console.WriteLine(data.data.fullName);
```

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "fullName": "MƏMMƏDOV ƏHMƏD HƏSƏN",
    "gender": "Kişi",
    "address": "Bakı şəhəri, Nəsimi rayonu, Ü.Hacıbəyov küç., 25",
    "birthDate": "15.03.1990",
    "fin": "7EMHZ9L",
    "sv": "AA3748461"
  }
}
```

### Error Responses
```json
// Missing parameters
{
  "error": "FİN və Seriya nömrəsi daxil edilməlidir"
}

// Login required
{
  "error": "LOGIN_REQUIRED",
  "message": "Aşağıda açılan Google pəncərəsindən ƏMAS'a daxil olun..."
}

// Data not found
{
  "error": "Məlumat tapılmadı. FİN və ŞV nömrəsini düzgün daxil etdiyinizdən əmin olun."
}
```

---

## ⚠️ Vacib Qeydlər

### 1. Serverless Platformlar İşləməz
- ❌ **Vercel** - Puppeteer dəstəyi yoxdur
- ❌ **Netlify** - Puppeteer dəstəyi yoxdur
- ✅ **Render.com** - Puppeteer işləyir (tövsiyə olunur)
- ✅ **VPS/Dedicated Server** - Tam kontrol

### 2. Cold Start
- İlk request 30-60 saniyə çəkə bilər (Render free tier)
- Sonrakı requestlər daha sürətli olacaq
- Production üçün paid plan tövsiyə olunur

### 3. Login Requirement
- Production-da bu API yalnız artıq login olmuş session-larla işləyir
- Əgər session bitibsə, `LOGIN_REQUIRED` error qaytaracaq
- VPS-də daimi browser session saxlamaq daha etibarlıdır

### 4. Rate Limiting
- Production-da rate limiting əlavə etmək tövsiyə olunur
- API key authentication əlavə edin
- CORS settings-i konfiqurasiya edin

---

## 🔄 Növbəti Addımlar

### Immediate
- [ ] GitHub repository yaradın
- [ ] Render.com-da deploy edin
- [ ] API URL-i test edin
- [ ] URL-i proyektlərinizə əlavə edin

### Optional Enhancements
- [ ] API key authentication əlavə edin
- [ ] Rate limiting implement edin
- [ ] Logging və monitoring əlavə edin
- [ ] Custom domain konfiqurasiya edin
- [ ] Paid plan-a keçin (daha sürətli performance)

---

## 📞 Kömək

### Problemlər
1. **Deployment issues**: `DEPLOYMENT.md` faylına baxın
2. **API errors**: Render logs-a baxın (Dashboard → Logs)
3. **Testing**: `test-deployed-api.ps1` scriptini işlədin

### Faydalı Linklər
- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Puppeteer Docs: https://pptr.dev

---

## ✨ Uğurlar!

API-niz hazırdır və istənilən platformada istifadə edilə bilər:
- ✅ Web applications (React, Vue, Angular)
- ✅ Mobile apps (React Native, Flutter)
- ✅ Backend services (Node.js, Python, PHP, C#)
- ✅ Desktop applications (Electron, .NET)

**API URL-inizi saxlayın və proyektlərinizə inteqrasiya edin!** 🚀
