import { test, expect } from '@playwright/test';

// Helper to enter app from landing page
async function enterApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.click('button:has-text("Try the Demo")');
  await expect(page.locator('.header')).toBeVisible({ timeout: 5000 });
}

test.describe('New Table Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
  });

  test('newly added table has highlight animation class', async ({ page }) => {
    // Click Add Table dropdown button
    await page.locator('button:has-text("Add Table")').first().click();

    // Select Round Table from dropdown
    await page.locator('button:has-text("Round Table")').click();

    // The new table should have the newly-added class immediately
    const newlyAddedTable = page.locator('.table-component.newly-added');
    await expect(newlyAddedTable).toBeVisible();
  });

  test('highlight animation class is removed after animation completes', async ({ page }) => {
    // Click Add Table dropdown button
    await page.locator('button:has-text("Add Table")').first().click();

    // Select Round Table from dropdown
    await page.locator('button:has-text("Round Table")').click();

    // Verify newly-added class is present initially
    const newlyAddedTable = page.locator('.table-component.newly-added');
    await expect(newlyAddedTable).toBeVisible();

    // Wait for animation to complete (1.5s) plus a small buffer
    await page.waitForTimeout(1700);

    // The newly-added class should be removed
    await expect(newlyAddedTable).toHaveCount(0);
  });

  test('different table shapes get highlight animation', async ({ page }) => {
    // Test rectangle table
    await page.locator('button:has-text("Add Table")').first().click();
    await page.locator('button:has-text("Rectangle Table")').click();

    const newlyAddedTable = page.locator('.table-component.newly-added');
    await expect(newlyAddedTable).toBeVisible();

    // Verify it's a rectangle
    await expect(newlyAddedTable).toHaveClass(/rectangle/);
  });
});
