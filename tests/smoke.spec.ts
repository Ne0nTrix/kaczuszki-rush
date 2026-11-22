import { expect, test } from '@playwright/test';

for (let level = 1; level <= 6; level++) {
  test(`poziom ${level} sie odpala`, async ({ page }) => {
    const bledy: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') bledy.push(m.text());
    });
    page.on('pageerror', (e) => bledy.push(e.message));

    await page.goto(`/?level=${level}&mute=1`);
    await page.waitForSelector('canvas');
    await page.waitForTimeout(2000);

    // troche pobiegac i poskakac, jak cos sie wywali to bedzie w konsoli
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(1200);
    await page.keyboard.press('Space');
    await page.waitForTimeout(800);
    await page.keyboard.up('ArrowRight');

    await page.screenshot({ path: `tests/screens/level${level}.png` });
    expect(bledy).toEqual([]);
  });
}
