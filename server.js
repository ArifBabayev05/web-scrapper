const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const functions = require('firebase-functions'); // New for Firebase

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true })); // Updated for Firebase compatibility
app.use(express.json());

// Path logging for debugging deployment issues
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Global variable to track if a launch is already in progress
let isLaunching = false;

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'E-Social Bot API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            scrape: '/api/scrape (POST)'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'E-Social Bot API is running' });
});

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
    if (isLaunching) {
        return res.status(429).json({
            error: "Brauzer hazırda başladılır, zəhmət olmasa bir neçə saniyə gözləyin."
        });
    }

    let browser;
    let page;

    try {
        let { fin, sv } = req.body;

        if (!fin || !sv) {
            return res.status(400).json({
                error: "FİN və Seriya nömrəsi daxil edilməlidir"
            });
        }

        // Clean SV: if starts with AZE, remove AZE and keep only digits
        if (sv.toUpperCase().startsWith("AZE")) {
            sv = sv.toUpperCase().replace("AZE", "").trim();
        }

        // Browser launch logic
        const remoteBrowserUrl = process.env.BROWSER_WS_ENDPOINT; // e.g., wss://chrome.browserless.io/...

        if (remoteBrowserUrl) {
            console.log("Connecting to remote browser...");
            browser = await puppeteer.connect({ browserWSEndpoint: remoteBrowserUrl });
        } else {
            // Development/Local launch logic
            try {
                // Try to connect to existing local Chrome first
                browser = await puppeteer.connect({
                    browserURL: 'http://127.0.0.1:9222',
                    defaultViewport: null
                });
                console.log("Connected to existing local Chrome");
            } catch (e) {
                isLaunching = true;
                try {
                    // Launch new instance with optimized flags for different environments
                    browser = await puppeteer.launch({
                        headless: process.env.NODE_ENV === 'production' ? 'new' : false,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-gpu',
                            '--no-zygote',
                            '--no-first-run'
                        ]
                    });
                    console.log("Launched new local Chrome instance");
                } catch (launchError) {
                    isLaunching = false;
                    throw new Error("Brauzer başlatmaq mümkün olmadı: " + launchError.message);
                } finally {
                    isLaunching = false;
                }
            }
        }

        // Handle "about:blank" by reusing the initial page if possible
        const pages = await browser.pages();
        page = pages.length > 0 ? pages[0] : await browser.newPage();

        const url = "https://eroom.e-social.gov.az/runApp?doc=project.AppEmploymentContractOnline&type=1&menu=AppEmploymentContractOnline_1";

        // Go to URL and wait
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // 3. ENHANCED LOGIN HANDLING
        if (page.url().includes('mygovid.gov.az') || page.url().includes('auth') || page.url().includes('login')) {
            return res.status(401).json({
                error: "LOGIN_REQUIRED",
                message: "Aşağıda açılan Google pəncərəsindən ƏMAS'a daxil olun və daha sonra Məlumatları Gətirmək üçün butona yenidən klik edin."
            });
        }

        // Clear modals function
        const clearModals = async () => {
            await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                const modalElements = elements.filter(el => {
                    const text = ((el).innerText || "").trim();
                    return text === "Bağla" || (text.includes("Bağla") && text.length < 15);
                });

                modalElements.forEach(el => {
                    let parent = el.parentElement;
                    let foundContainer = false;
                    for (let i = 0; i < 7; i++) {
                        if (parent && (parent.className.includes('modal') || parent.className.includes('popup') || parent.className.includes('dialog') || parent.className.includes('window'))) {
                            parent.remove();
                            foundContainer = true;
                            break;
                        }
                        if (parent) parent = parent.parentElement;
                    }
                    if (!foundContainer && el) el.remove();
                });

                const overlays = document.querySelectorAll('.modal-backdrop, .overlay, .mask, .ui-widget-overlay');
                overlays.forEach(o => o.remove());
                document.body.style.overflow = 'auto';
                document.documentElement.style.overflow = 'auto';
            });
        };

        await clearModals();
        await new Promise(r => setTimeout(r, 1000));

        // Click first row
        await page.evaluate(() => {
            const row = document.querySelector('table tbody tr');
            if (row) {
                row.click();
                row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                row.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }
        });

        await new Promise(r => setTimeout(r, 2000));
        await clearModals();
        await new Promise(r => setTimeout(r, 1000));

        // Fill FIN and SV
        const searchSuccess = await page.evaluate((finVal, svVal) => {
            const finInput = document.querySelector('input[placeholder*="FİN"], input[id*="fin"], input[name*="fin"]');
            const svInput = document.querySelector('input[placeholder*="ŞV"], input[placeholder*="nömrəsi"], input[name*="sv"]');

            if (finInput) {
                finInput.value = finVal;
                finInput.dispatchEvent(new Event('input', { bubbles: true }));
                finInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            if (svInput) {
                svInput.value = svVal;
                svInput.dispatchEvent(new Event('input', { bubbles: true }));
                svInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            const btn = (() => {
                if (svInput) {
                    let p = svInput.parentElement;
                    for (let i = 0; i < 3; i++) {
                        if (p) {
                            const b = p.querySelector('button, .q-btn, [role="button"]');
                            if (b) return b;
                            p = p.parentElement;
                        }
                    }
                }
                const icons = Array.from(document.querySelectorAll('i, svg'));
                for (const icon of icons) {
                    const isSearch = (icon.className && (typeof icon.className === 'string') && (icon.className.includes('search') || icon.className.includes('lupa')));
                    if (isSearch || (icon.tagName === 'SVG' && icon.closest('.q-btn'))) return (icon.closest('button, [role="button"]') || icon);
                }
                return Array.from(document.querySelectorAll('button, .q-btn')).find(b => {
                    const s = window.getComputedStyle(b);
                    return s.backgroundColor.includes('rgb(0, 51, 153)') || s.backgroundColor.includes('rgb(0, 41, 114)');
                });
            })();

            if (btn) {
                btn.click();
                return true;
            }
            return false;
        }, fin, sv);

        if (!searchSuccess) {
            return res.status(404).json({
                error: "Axtarış düyməsi tapılmadı. Zəhmət olmasa səhifənin tam yükləndiyindən əmin olun."
            });
        }

        // Wait for results
        await new Promise(r => setTimeout(r, 5000));

        const resultData = await page.evaluate(() => {
            const data = {};

            const cleanText = (t) => t.trim().toLowerCase().replace(/:$/, "").trim();

            // STRATEGY 1: Standard Field Mapping
            const fields = document.querySelectorAll('.q-field, .form-group, .row > div');
            fields.forEach(field => {
                const labelEl = field.querySelector('.q-field__label, label, .q-field__messages, .q-field__prefix');
                if (!labelEl) return;

                const label = cleanText(labelEl.innerText);
                if (!label || label.length > 50) return;

                const input = field.querySelector('input, select, textarea');
                const nativeValue = field.querySelector('.q-field__native');
                const controlText = field.querySelector('.q-field__control-container');

                let value = "";
                if (input && input.value && input.value.trim() !== "...") {
                    value = input.value;
                } else if (nativeValue) {
                    value = nativeValue.innerText;
                } else if (controlText) {
                    const clone = controlText.cloneNode(true);
                    const l = clone.querySelector('.q-field__label, label');
                    if (l) l.remove();
                    value = clone.innerText;
                }

                value = value.trim();
                if (value && value !== "..." && !data[label]) {
                    data[label] = value;
                }
            });

            // STRATEGY 2: Global Keyword Search
            const targetKeywords = ["doğum tarixi", "cinsi", "soyadı", "adı", "ata adı", "ünvan"];
            const allPossibleLabels = Array.from(document.querySelectorAll('.q-field__label, label, span, b, p'));

            targetKeywords.forEach(kw => {
                const foundLabel = allPossibleLabels.find(el => cleanText(el.innerText) === kw);
                if (foundLabel) {
                    const parent = foundLabel.closest('.q-field, div');
                    if (parent) {
                        const valEl = parent.querySelector('input, .q-field__native, .q-field__control');
                        if (valEl) {
                            const val = valEl.value || valEl.innerText;
                            if (val && val.trim() !== "..." && !data[kw]) {
                                data[kw] = val.trim();
                            }
                        }
                    }
                }
            });

            return data;
        });

        // Debug log
        console.log("Scraped Raw Data:", resultData);

        // Map the data with higher precision
        const mapped = {};
        const findVal = (keywords) => {
            for (const kw of keywords) {
                const exact = resultData[kw.toLowerCase()];
                if (exact) return exact;
            }
            const key = Object.keys(resultData).find(k => keywords.some(kw => k.includes(kw.toLowerCase())));
            return key ? resultData[key] : null;
        };

        const ad = findVal(["adı", "ad"]);
        const soyad = findVal(["soyadı", "soyad"]);
        const ata = findVal(["ata adı", "atasının"]);
        const unvan = findVal(["ünvan", "yaşayış yeri", "qeydiyyat"]);
        const rawCins = findVal(["cinsi", "cins"]);
        const dogum = findVal(["doğum tarixi", "tarixi", "dogum"]);

        if (ad || soyad) {
            // Processing Father's Name and Gender Suffix
            const rawAta = ata || "";
            const cleanAta = rawAta.split(' ')[0].trim();
            const ataUpper = rawAta.toUpperCase();

            mapped.fullName = `${soyad || ""} ${ad || ""} ${cleanAta}`.trim().toUpperCase();

            // Gender detection
            let detectedGender = "";
            const cinsLow = (rawCins || "").toLowerCase();

            if (cinsLow.includes("kişi") || cinsLow.includes("kisi")) {
                detectedGender = "Kişi";
            } else if (cinsLow.includes("qadın") || cinsLow.includes("qadin") || cinsLow.includes("kadın")) {
                detectedGender = "Qadın";
            } else {
                if (ataUpper.includes("OĞLU")) detectedGender = "Kişi";
                else if (ataUpper.includes("QIZI")) detectedGender = "Qadın";
                else detectedGender = rawCins || "";
            }

            mapped.gender = detectedGender;
            mapped.address = unvan || "";
            mapped.birthDate = dogum || "";
            mapped.fin = fin;
            mapped.sv = sv;

            if (browser) await browser.close();
            return res.json({
                success: true,
                data: mapped
            });
        } else {
            if (browser) await browser.close();
            return res.status(404).json({
                error: "Məlumat tapılmadı. FİN və ŞV nömrəsini düzgün daxil etdiyinizdən əmin olun."
            });
        }

    } catch (error) {
        if (browser) await browser.close();
        console.error("Scraping error:", error);
        return res.status(500).json({
            error: "Sistem xətası: " + error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Export for Firebase Functions
exports.api = functions.https.onRequest(app);

// Start server locally only if not running in a functions environment
if (process.env.NODE_ENV !== 'production' || !process.env.FUNCTION_SIGNATURE_TYPE) {
    app.listen(PORT, () => {
        console.log(`🚀 E-Social Bot API running on port ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📍 Scrape endpoint: http://localhost:${PORT}/api/scrape`);
    });
}

module.exports = app;
