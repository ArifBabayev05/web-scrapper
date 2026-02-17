# E-Social Bot API

Web scraping API for e-social.gov.az portal

## 🚀 Installation

```bash
npm install
```

## 🏃 Running Locally

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Health Check
```bash
GET /api/health
```

### Scrape E-Social Data
```bash
POST /api/scrape
Content-Type: application/json

{
  "fin": "7EMHZ9L",
  "sv": "AA3748461"
}
```

## 🧪 Test Commands (cURL)

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Scrape Data - Example 1
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"7EMHZ9L\",\"sv\":\"AA3748461\"}"
```

### 3. Scrape Data - Example 2 (with AZE prefix)
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"5ABC123\",\"sv\":\"AZE1234567\"}"
```

### 4. Test Error Handling (Missing FIN)
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"sv\":\"AA3748461\"}"
```

### 5. Test Error Handling (Missing SV)
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d "{\"fin\":\"7EMHZ9L\"}"
```

## 📦 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "fullName": "MƏMMƏDOV ƏHMƏD HƏSƏN",
    "gender": "Kişi",
    "address": "Bakı şəhəri, Nəsimi rayonu...",
    "birthDate": "15.03.1990",
    "fin": "7EMHZ9L",
    "sv": "AA3748461"
  }
}
```

### Error Response
```json
{
  "error": "FİN və Seriya nömrəsi daxil edilməlidir"
}
```

### Login Required Response
```json
{
  "error": "LOGIN_REQUIRED",
  "message": "Aşağıda açılan Google pəncərəsindən ƏMAS'a daxil olun və daha sonra Məlumatları Gətirmək üçün butona yenidən klik edin."
}
```

## 🌐 Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Railway / Render
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy

## ⚠️ Important Notes

1. **Puppeteer in Production**: Puppeteer may not work on serverless platforms like Vercel due to Chrome binary limitations. Consider using:
   - **Railway.app** (recommended)
   - **Render.com**
   - **DigitalOcean App Platform**
   - **VPS (Dedicated Server)**

2. **Chrome Remote Debugging**: The API tries to connect to Chrome on port 9222 first. Make sure Chrome is running with:
   ```bash
   chrome.exe --remote-debugging-port=9222
   ```

3. **User Data Directory**: Browser session is saved in `./user_data_legal_bot` to persist login sessions.

## 🔧 Environment Variables

```env
PORT=3000
```

## 📝 License

ISC
