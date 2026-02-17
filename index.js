const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        // 1. Əvvəlcə açıq olan Chrome-a (port 9222) qoşulmağa çalışırıq
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        console.log("Mövcud Chrome brauzerinə qoşuldu.");
    } catch (e) {
        // 2. Əgər açıq Chrome tapılmasa, yenisini açırıq
        console.log("Açıq brauzer tapılmadı, yeni brauzer başladılır...");
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
            userDataDir: './user_data'
        });
    }

    const page = await browser.newPage();

    // Sayta gedirik
    const url = "https://eroom.e-social.gov.az/runApp?doc=project.AppEmploymentContractOnline&type=1&menu=AppEmploymentContractOnline_1";
    console.log("Sayta giriş edilir...");
    await page.goto(url, { waitUntil: 'networkidle2' });

    // LOGIN YOXLANISI (Sessiya bitibsə mygovid-ə yönləndirir)
    if (page.url().includes('mygovid.gov.az') || page.url().includes('auth')) {
        console.log("Sessiya bitib və ya giriş tələb olunur.");
        console.log("Zəhmət olmasa brauzerdə daxil olun. Giriş gözlənilir...");

        // Giriş tamamlanana qədər gözləyirik (URL-də yenidən e-social görünənə qədər)
        await page.waitForFunction(
            () => window.location.href.includes('e-social.gov.az'),
            { timeout: 0 } // User daxil olana qədər limitsiz gözləyirik
        );

        console.log("Giriş uğurlu! Hədəf səhifəyə keçid edilir...");
        await page.goto(url, { waitUntil: 'networkidle2' });
    }

    // Modalları təmizləmək üçün funksiya
    const clearModals = async () => {
        try {
            await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                const modalElements = elements.filter(el => {
                    const text = (el.innerText || "").trim();
                    return text === "Bağla" || (text.includes("Bağla") && text.length < 15);
                });

                modalElements.forEach(el => {
                    let parent = el.parentElement;
                    let foundContainer = false;
                    for (let i = 0; i < 7; i++) { // Bir az daha dərindən axtarırıq
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
            console.log("Modallar təmizləndi.");
        } catch (e) {
            console.log("Modal təmizlənərkən xəta:", e.message);
        }
    };

    // 1. İLK MODALI MƏHV ETMƏK
    console.log("İlk modal təmizlənir...");
    await clearModals();
    await new Promise(r => setTimeout(r, 1000));

    // 2. İLK SƏTRİ SEÇMƏK
    try {
        console.log("İlk sətir seçilir...");
        const rowClicked = await page.evaluate(() => {
            const row = document.querySelector('table tbody tr');
            if (row) {
                row.click();
                row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                row.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                return true;
            }
            return false;
        });
        if (rowClicked) console.log("İlk sətir klikləndi.");
    } catch (e) {
        console.log("İlk sətir seçilərkən xəta:", e.message);
    }

    // İlk sətir seçildikdən sonra gələn ikinci modalı da təmizləyirik
    await new Promise(r => setTimeout(r, 2000));
    console.log("İkinci modal (varsa) təmizlənir...");
    await clearModals();
    await new Promise(r => setTimeout(r, 1000));

    // 3. FİN VƏ ŞV NÖMRƏSİ DAXİL ETMƏK FUNKSİYASI
    const fillAndSearch = async (fin, sv) => {
        try {
            console.log(`Məlumatlar daxil edilir: FİN=${fin}, ŞV=${sv}`);
            await page.evaluate((finVal, svVal) => {
                // FİN inputu
                const finInput = document.querySelector('input[placeholder*="FİN"], input[id*="fin"], input[name*="fin"]');
                if (finInput) {
                    finInput.value = finVal;
                    finInput.dispatchEvent(new Event('input', { bubbles: true }));
                    finInput.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // ŞV-nin nömrəsi inputu
                const svInput = document.querySelector('input[placeholder*="ŞV"], input[placeholder*="nömrəsi"], input[name*="sv"]');
                if (svInput) {
                    svInput.value = svVal;
                    svInput.dispatchEvent(new Event('input', { bubbles: true }));
                    svInput.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Lupa (Search) düyməsi
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
                        const isSearch = icon.className && (typeof icon.className === 'string') && (icon.className.includes('search') || icon.className.includes('lupa'));
                        if (isSearch || (icon.tagName === 'SVG' && icon.closest('.q-btn'))) return icon.closest('button, [role="button"]') || icon;
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
            console.log("Məlumatlar yazıldı və axtarış düyməsi basıldı.");
        } catch (e) {
            console.log("Daxil etmə zamanı xəta:", e.message);
        }
    };

    // İlk olaraq DİN üçün axtarış edirik
    await fillAndSearch('7EMHZ9L', 'AA3748461');

    // 4. MƏLUMATLARI KOPYALAMAQ VƏ FAYLA YAZMAQ
    console.log("Məlumatların gəlməsi gözlənilir (4 saniyə)...");
    await new Promise(r => setTimeout(r, 4000));

    try {
        const resultData = await page.evaluate(() => {
            const data = {};
            const inputs = Array.from(document.querySelectorAll('input, select, textarea, .q-field__native, .q-field__control-container'));
            inputs.forEach(el => {
                let label = "";
                if (el.id) {
                    const l = document.querySelector(`label[for="${el.id}"]`);
                    if (l) label = l.innerText.trim();
                }
                if (!label) {
                    const parent = el.closest('.q-field, .form-group, div');
                    const l = parent ? parent.querySelector('label, .q-field__label') : null;
                    if (l) label = l.innerText.trim();
                }
                const value = el.value || el.innerText || "";
                if (label && value && value !== "..." && label.length < 50) {
                    data[label] = value.trim();
                }
            });
            return data;
        });

        const fs = require('fs');
        let outputText = "--- E-SOCIAL BOT ÇIXARIŞI ---\n";
        outputText += `Tarix: ${new Date().toLocaleString()}\n\n`;
        for (const [key, value] of Object.entries(resultData)) {
            outputText += `${key}: ${value}\n`;
        }
        const fileName = `melumat_${Date.now()}.txt`;
        fs.writeFileSync(fileName, outputText, 'utf-8');
        console.log(`Məlumatlar '${fileName}' faylına yazıldı.`);
    } catch (e) {
        console.log("Kopyalama zamanı xəta:", e.message);
    }

    // // 5. MİQRASİYA VƏ QAÇQIN TABLARINA KEÇİD VƏ YENİDƏN AXTARIS
    // try {
    //     const tabs = ["Miqrasiya xidməti", "Qaçqın"];
    //     for (const tabName of tabs) {
    //         console.log(`'${tabName}' tabına keçid edilir...`);
    //         await page.evaluate((name) => {
    //             const labels = Array.from(document.querySelectorAll('label, span, div'));
    //             const targetTab = labels.find(el => (el.innerText || "").trim() === name);
    //             if (targetTab) {
    //                 const clickable = targetTab.querySelector('input') || targetTab;
    //                 clickable.click();
    //                 clickable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    //                 clickable.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    //                 clickable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    //             }
    //         }, tabName);

    //         await new Promise(r => setTimeout(r, 2000));
    //         // Hər tabda yenidən FİN yaz və Axtar
    //         await fillAndSearch('7EMHZ9L', 'AA3748461');
    //         console.log(`'${tabName}' üçün axtarış verildi. 5 saniyə gözlənilir...`);
    //         await new Promise(r => setTimeout(r, 5000));
    //     }
    // } catch (e) {
    //     console.log("Tab keçidi xətası:", e.message);
    // }

    console.log("Proses bitdi. Brauzer açıq qalıb.");
})();