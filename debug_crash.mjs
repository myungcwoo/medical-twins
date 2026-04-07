import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => {
        console.log('BROWSER ERROR:', err.message);
        console.log('STACK:', err.stack);
    });

    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const startBtn = btns.find(b => b.innerText.includes('Start'));
        if (startBtn) startBtn.click();
    });

    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
})();
