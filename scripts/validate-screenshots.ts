import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();

  // 1. Auth Page
  await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/auth.png', fullPage: true });
  console.log('✅ auth.png');

  // Authenticate using test ID (user-iulia)
  await page.click('[data-testid="btn-demo-user-user-iulia"]');
  await page.waitForTimeout(1500);
  console.log('Authenticated');

  // 2. Discover page (already here after auth)
  await page.screenshot({ path: 'screenshots/validate/discover.png', fullPage: true });
  console.log('✅ discover.png');

  // 3. Event page - direct URL navigation (works because localStorage persists auth)
  await page.goto('http://localhost:5173/event/event-tennis', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/event-details.png', fullPage: true });
  console.log('✅ event-details.png');

  // 4. Click People tab
  await page.click('[data-testid="tab-people"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/event-people.png', fullPage: true });
  console.log('✅ event-people.png');

  // 5. Click Location tab
  await page.click('[data-testid="tab-location"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/event-map.png', fullPage: true });
  console.log('✅ event-map.png');

  // 6. Click Chat tab
  await page.click('[data-testid="tab-chat"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/event-chat.png', fullPage: true });
  console.log('✅ event-chat.png');

  // 7. Create page - via nav click
  await page.click('[data-testid="nav-create"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/create.png', fullPage: true });
  console.log('✅ create.png');

  // 8. Profile
  await page.click('[data-testid="nav-profile"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/profile.png', fullPage: true });
  console.log('✅ profile.png');

  // 9. Chats
  await page.click('[data-testid="nav-chats"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/chats.png', fullPage: true });
  console.log('✅ chats.png');

  // 10. Chat page - direct URL
  await page.goto('http://localhost:5173/chat/event-tennis', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/validate/chat.png', fullPage: true });
  console.log('✅ chat.png');

  await browser.close();
  console.log('\nDone - all screenshots captured');
}

main();
