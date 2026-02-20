// Global error handling
process.on('uncaughtException', (err) => {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR:');
    console.error(err);
    console.log('\nPress any key to exit...');
    if (process.stdin.setRawMode) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', () => process.exit(1));
    } else {
        setTimeout(() => process.exit(1), 10000);
    }
});

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 4000;

// Helper to find local Chrome
const getChromePath = () => {
    const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
};

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Path logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

let isLaunching = false;
let globalBrowser = null;

// The core function to ensure browser is open
async function ensureBrowser() {
    if (globalBrowser) {
        try {
            await globalBrowser.version();
            return globalBrowser;
        } catch (e) {
            globalBrowser = null;
        }
    }

    if (isLaunching) return null;
    isLaunching = true;

    try {
        console.log("Brauzer açılır...");
        const chromePath = getChromePath();

        // Launch real Chrome via system command
        const launchChrome = () => {
            return new Promise((resolve) => {
                const chromePath = getChromePath();
                if (!chromePath) {
                    console.error("Chrome tapılmadı!");
                    return resolve(false);
                }

                const cmd = `"${chromePath}" --remote-debugging-port=9222 --start-maximized --no-first-run --no-default-browser-check "https://eroom.e-social.gov.az/runApp?doc=project.AppEmploymentContractOnline&type=1&menu=AppEmploymentContractOnline_1"`;

                exec(cmd, (err) => {
                    if (err) console.error("Chrome başlatma xətası:", err.message);
                });

                // Short delay to allow process to start
                setTimeout(() => resolve(true), 1500);
            });
        };

        let browser;
        try {
            browser = await puppeteer.connect({
                browserURL: 'http://127.0.0.1:9222',
                defaultViewport: null
            });
            console.log("Mövcud brauzerə qoşuldu.");
        } catch (e) {
            await launchChrome();
            try {
                // Retry connection with short timeout
                browser = await puppeteer.connect({
                    browserURL: 'http://127.0.0.1:9222',
                    defaultViewport: null
                });
                console.log("Yeni brauzer başladıldı və qoşuldu.");
            } catch (connError) {
                console.error("Brauzerə qoşulmaq mümkün olmadı:", connError.message);
                return null;
            }
        }

        globalBrowser = browser;
        const pages = await browser.pages();
        let page = pages.find(p => p.url().includes('e-social.gov.az')) || pages[0];

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        const targetUrl = "https://eroom.e-social.gov.az/runApp?doc=project.AppEmploymentContractOnline&type=1&menu=AppEmploymentContractOnline_1";
        if (!page.url().includes('AppEmploymentContractOnline')) {
            page.goto(targetUrl).catch(() => { }); // Fire and forget to speed up
        }

        console.log("\x1b[32m%s\x1b[0m", "✅ Brauzer hazırdır!");
        return globalBrowser;
    } catch (err) {
        console.error("Brauzer başlatma xətası:", err.message);
        return null;
    } finally {
        isLaunching = false;
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', browserOpen: !!globalBrowser });
});

// Scrape endpoint
app.post('/api/scrape', async (req, res) => {
    let browser = await ensureBrowser();
    if (!browser) {
        return res.status(500).json({ error: "Brauzer hazır deyil və ya başladıla bilmədi." });
    }

    try {
        let { fin, sv } = req.body;
        if (!fin || !sv) return res.status(400).json({ error: "FİN və Seriya nömrəsi daxil edilməlidir" });

        if (sv.toUpperCase().startsWith("AZE")) {
            sv = sv.toUpperCase().replace("AZE", "").trim();
        }

        const pages = await browser.pages();
        const page = pages.find(p => p.url().includes('e-social.gov.az')) || pages[0];

        // If we are on login page, just tell the user to login manually
        if (page.url().includes('mygovid.gov.az') || page.url().includes('auth')) {
            return res.status(401).json({
                error: "LOGIN_REQUIRED",
                message: "Zəhmət olmasa Asan İmza ilə daxil olun."
            });
        }

        const url = "https://eroom.e-social.gov.az/runApp?doc=project.AppEmploymentContractOnline&type=1&menu=AppEmploymentContractOnline_1";
        if (!page.url().includes('AppEmploymentContractOnline')) {
            await page.goto(url, { waitUntil: 'networkidle2' });
        }

        // Check again after navigation
        if (page.url().includes('mygovid.gov.az')) {
            return res.status(401).json({
                error: "LOGIN_REQUIRED",
                message: "Zəhmət olmasa Asan İmza ilə daxil olun."
            });
        }

        // Modalları təmizləmək
        const clearModals = async () => {
            await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                const modalElements = elements.filter(el => {
                    const text = (el.innerText || "").trim();
                    return text === "Bağla" || (text.includes("Bağla") && text.length < 15);
                });
                modalElements.forEach(el => {
                    let parent = el.parentElement;
                    for (let i = 0; i < 7; i++) {
                        if (parent && (parent.className.includes('modal') || parent.className.includes('popup') || parent.className.includes('dialog'))) {
                            parent.remove(); break;
                        }
                        if (parent) parent = parent.parentElement;
                    }
                    if (el) el.remove();
                });
                const overlays = document.querySelectorAll('.modal-backdrop, .overlay, .mask');
                overlays.forEach(o => o.remove());
                document.body.style.overflow = 'auto';
            });
        };

        await clearModals();
        await new Promise(r => setTimeout(r, 1000));

        await page.evaluate(() => {
            const row = document.querySelector('table tbody tr');
            if (row) row.click();
        });

        await new Promise(r => setTimeout(r, 2000));
        await clearModals();

        const searchSuccess = await page.evaluate((finVal, svVal) => {
            const finInput = document.querySelector('input[placeholder*="FİN"], input[id*="fin"]');
            const svInput = document.querySelector('input[placeholder*="nömrəsi"], input[name*="sv"]');

            if (finInput) {
                finInput.value = finVal;
                finInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (svInput) {
                svInput.value = svVal;
                svInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            const btn = Array.from(document.querySelectorAll('button, .q-btn')).find(b => {
                const s = window.getComputedStyle(b);
                return s.backgroundColor.includes('rgb(0, 51, 153)') || s.backgroundColor.includes('rgb(0, 41, 114)');
            });

            if (btn) { btn.click(); return true; }
            return false;
        }, fin, sv);

        if (!searchSuccess) return res.status(404).json({ error: "Axtarış düyməsi tapılmadı." });

        await new Promise(r => setTimeout(r, 5000));

        const resultData = await page.evaluate(() => {
            const data = {};
            const cleanText = (t) => t.trim().toLowerCase().replace(/:$/, "").trim();
            const fields = document.querySelectorAll('.q-field, .form-group');
            fields.forEach(field => {
                const labelEl = field.querySelector('.q-field__label, label');
                if (!labelEl) return;
                const label = cleanText(labelEl.innerText);
                const input = field.querySelector('input, .q-field__native');
                const value = input ? (input.value || input.innerText) : "";
                if (label && value && value.trim() !== "...") data[label] = value.trim();
            });
            return data;
        });

        const mapped = {
            fullName: `${resultData['soyadı'] || ""} ${resultData['adı'] || ""} ${resultData['ata adı'] || ""}`.trim().toUpperCase(),
            gender: resultData['cinsi'] || "",
            address: resultData['ünvan'] || "",
            birthDate: resultData['doğum tarixi'] || "",
            fin, sv
        };

        return res.json({ success: true, data: mapped });

    } catch (error) {
        console.error("Scraping error:", error);
        return res.status(500).json({ error: "Xəta: " + error.message });
    }
});

// Start server and launch browser
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`\n\x1b[32m%s\x1b[0m`, `🚀 Server işə düşdü! Port: ${PORT}`);
    console.log(`📍 URL: http://127.0.0.1:${PORT}`);
    console.log(`\x1b[34m%s\x1b[0m`, `--- BU PƏNCƏRƏNİ BAĞLAMAYIN ---`);

    // Launch browser in background (non-blocking)
    ensureBrowser();
});

// Handle port conflicts gracefully
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log('\x1b[33m%s\x1b[0m', `⚠️ Bot artıq çalışır (Port ${PORT} məşğuldur). Yenidən başlatmağa ehtiyac yoxdur.`);
        setTimeout(() => process.exit(0), 3000);
    } else {
        console.error('Server xətası:', e);
    }
});

