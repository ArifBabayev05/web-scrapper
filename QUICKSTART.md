# 🚀 Quick Start Guide

## 🎯 Deploy to Render.com (Recommended - 10 minutes)

### Step 1: Prepare GitHub Repository
```bash
cd c:\Users\arif.babayev\Desktop\e-social-bot
git init
git add .
git commit -m "Initial commit: E-Social Bot API"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Name: `e-social-bot-api`
3. Click "Create repository"
4. Run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/e-social-bot-api.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render
1. Go to https://render.com
2. Click "Get Started" → Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub account (if not connected)
5. Select `e-social-bot-api` repository
6. Configure settings:
   - **Name**: `e-social-bot-api`
   - **Environment**: `Node`
   - **Region**: `Frankfurt (EU Central)` (closest to Azerbaijan)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
7. Click "Create Web Service"
8. Wait 5-10 minutes for first deployment (Puppeteer installation takes time)
9. Monitor logs - wait for "🚀 E-Social Bot API running on port..."
10. Copy your API URL from the top of the page
    - Example: `https://e-social-bot-api.onrender.com`

### Step 4: Test Your Deployed API
```bash
# Replace YOUR-API-URL with your actual Render URL
curl https://YOUR-API-URL.onrender.com/api/health

# Test scraping
curl -X POST https://YOUR-API-URL.onrender.com/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"7EMHZ9L\",\"sv\":\"AA3748461\"}"
```

**PowerShell (Windows):**
```powershell
# Health Check
Invoke-RestMethod -Uri "https://YOUR-API-URL.onrender.com/api/health"

# Scrape Data
$body = @{ fin = "7EMHZ9L"; sv = "AA3748461" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://YOUR-API-URL.onrender.com/api/scrape" `
  -Method POST -Body $body -ContentType "application/json"
```

---

## 🔄 Alternative: Run Locally (For Development)

### Step 1: Install Dependencies
```bash
cd c:\Users\arif.babayev\Desktop\e-social-bot
npm install
```

### Step 2: Start Server
```bash
npm start
```

### Step 3: Test Locally
```bash
# Health check
curl http://localhost:3000/api/health

# Scrape data
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"7EMHZ9L\",\"sv\":\"AA3748461\"}"
```

---

## 🧪 Testing Your Deployed API

### Windows (PowerShell)
```powershell
# Edit test-deployed-api.ps1 and update API_URL
# Then run:
.\test-deployed-api.ps1
```

### Linux/Mac (Bash)
```bash
# Edit test-deployed-api.sh and update API_URL
chmod +x test-deployed-api.sh
./test-deployed-api.sh
```

---

## 📱 Use in Your Projects

### JavaScript/TypeScript
```javascript
const API_URL = 'https://YOUR-API-URL/api/scrape';

async function getEmployeeData(fin, sv) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fin, sv })
  });
  return await response.json();
}

// Usage
const data = await getEmployeeData('7EMHZ9L', 'AA3748461');
console.log(data);
```

### Python
```python
import requests

API_URL = "https://YOUR-API-URL/api/scrape"

def get_employee_data(fin, sv):
    response = requests.post(API_URL, json={"fin": fin, "sv": sv})
    return response.json()

# Usage
data = get_employee_data("7EMHZ9L", "AA3748461")
print(data)
```

### PHP
```php
<?php
$api_url = "https://YOUR-API-URL/api/scrape";
$data = json_encode(["fin" => "7EMHZ9L", "sv" => "AA3748461"]);

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>
```

---

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed to Railway/Render
- [ ] API URL obtained
- [ ] Health check tested
- [ ] Scrape endpoint tested
- [ ] API URL saved for future use
- [ ] Integrated into your project

---

## 🆘 Troubleshooting

### "Puppeteer failed to launch"
- **Solution**: Make sure you're using Railway or Render, NOT Vercel/Netlify

### "Connection timeout"
- **Solution**: First request may take 30-60 seconds (cold start). Try again.

### "LOGIN_REQUIRED error"
- **Solution**: This is expected. The API requires an active e-social session. For production use, consider running on a VPS with persistent browser session.

### "Module not found"
- **Solution**: Make sure `npm install` ran successfully during deployment

---

## 📞 Need Help?

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
2. Check [README.md](README.md) for API documentation
3. Check Railway/Render logs for errors
4. Open a GitHub issue

---

## 🎉 Success!

Your API is now live and ready to use across different projects and platforms!

**Next Steps:**
- Add authentication (API keys)
- Implement rate limiting
- Add monitoring/logging
- Set up CI/CD pipeline
