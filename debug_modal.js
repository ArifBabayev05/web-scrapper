const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        console.log("Connected to existing browser.");
    } catch (e) {
        console.log("Starting new browser...");
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
            userDataDir: './user_data'
        });
    }

    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Check for iframes
    const frames = page.frames();
    console.log(`Number of frames: ${frames.length}`);
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        console.log(`Frame ${i}: ${frame.url()}`);
        const hasBağla = await frame.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('button, div, span, a'));
            return elements.some(el => el.innerText && el.innerText.includes('Bağla'));
        });
        console.log(`Frame ${i} has 'Bağla': ${hasBağla}`);
    }

    // Capture the text of all buttons in all frames
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const buttonTexts = await frame.evaluate(() => {
            return Array.from(document.querySelectorAll('button')).map(b => b.innerText);
        });
        if (buttonTexts.length > 0) {
            console.log(`Frame ${i} buttons:`, buttonTexts);
        }
    }

    // await browser.disconnect();
})();
