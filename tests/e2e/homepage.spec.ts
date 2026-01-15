import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await expect(page.locator('h1')).toHaveText('Unified Enterprise Web Kernel');

    // Check feature cards are visible
    await expect(page.locator('text=Security First')).toBeVisible();
    await expect(page.locator('text=AI Integrated')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=PWA Ready')).toBeVisible();
});

test('page is installable as PWA', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check manifest is linked
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
});
