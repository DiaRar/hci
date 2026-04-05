import { chromium } from 'playwright';

async function main() {
  const pages = [
    { path: '/discover', name: 'discover.png' },
    { path: '/auth', name: 'auth.png' },
    { path: '/profile/me', name: 'profile.png' },
    { path: '/event/event-tennis', name: 'event.png' },
    { path: '/create', name: 'create.png' },
  ];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });

  for (const { path, name } of pages) {
    const page = await context.newPage();
    await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: `screenshots/after/${name}`, fullPage: false });
    console.log(`Screenshot: ${name}`);
    await page.close();
  }

  await browser.close();
  console.log('Done');
}

main();
