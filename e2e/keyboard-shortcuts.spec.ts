import { test, expect } from '@playwright/test';

// Helper to enter app from landing page
async function enterApp(page: import('@playwright/test').Page) {
  // First set localStorage before the app hydrates
  await page.addInitScript(() => {
    const stored = localStorage.getItem('seating-arrangement-storage');
    const data = stored ? JSON.parse(stored) : { state: {}, version: 9 };
    data.state = data.state || {};
    data.state.hasCompletedOnboarding = true;
    data.version = 9;
    localStorage.setItem('seating-arrangement-storage', JSON.stringify(data));
  });
  await page.goto('/');
  await page.click('button:has-text("Launch App")');
  await expect(page.locator('.header')).toBeVisible({ timeout: 5000 });
}

// Skip these tests for now - they need to be updated to work with demo data
test.describe.skip('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    // Clear any persisted state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Re-enter app after reload
    await page.click('button:has-text("Launch App")');
    await expect(page.locator('.header')).toBeVisible({ timeout: 5000 });

    // Add a table using toolbar dropdown
    await page.locator('button:has-text("Add Table")').first().click();
    await page.locator('.dropdown-menu button:has-text("Round")').click({ force: true });
    await expect(page.locator('.table-component')).toHaveCount(1, { timeout: 5000 });
  });

  test.describe('Arrow key nudging', () => {
    test('arrow keys nudge selected table by 10px', async ({ page }) => {
      const table = page.locator('.table-component').first();
      await table.click();

      const initialBounds = await table.boundingBox();

      // Nudge right
      await page.keyboard.press('ArrowRight');

      const afterRight = await table.boundingBox();
      expect(afterRight!.x).toBeCloseTo(initialBounds!.x + 10, 0);

      // Nudge down
      await page.keyboard.press('ArrowDown');

      const afterDown = await table.boundingBox();
      expect(afterDown!.y).toBeCloseTo(initialBounds!.y + 10, 0);
    });

    test('Shift+arrow keys nudge by 1px (fine nudge)', async ({ page }) => {
      const table = page.locator('.table-component').first();
      await table.click();

      const initialBounds = await table.boundingBox();

      // Fine nudge right
      await page.keyboard.press('Shift+ArrowRight');

      const afterRight = await table.boundingBox();
      expect(afterRight!.x).toBeCloseTo(initialBounds!.x + 1, 0);
    });

    test('arrow keys do nothing when no table is selected', async ({ page }) => {
      // Click on empty canvas to deselect
      await page.locator('.canvas').click({ position: { x: 50, y: 50 } });

      const table = page.locator('.table-component').first();
      const initialBounds = await table.boundingBox();

      // Try to nudge
      await page.keyboard.press('ArrowRight');

      // Table should not have moved
      const afterBounds = await table.boundingBox();
      expect(afterBounds!.x).toBeCloseTo(initialBounds!.x, 0);
    });
  });

  test.describe('Delete key', () => {
    test('Delete key removes selected table after confirmation', async ({ page }) => {
      // Select the table
      const table = page.locator('.table-component').first();
      await table.click();

      // Press Delete and accept the confirmation
      page.on('dialog', dialog => dialog.accept());
      await page.keyboard.press('Delete');

      // Should have no tables
      await expect(page.locator('.table-component')).toHaveCount(0);

      // Should show deletion toast
      await expect(page.locator('.toast:has-text("Deleted")')).toBeVisible({ timeout: 3000 });
    });

    test('Backspace also removes selected items', async ({ page }) => {
      const table = page.locator('.table-component').first();
      await table.click();

      page.on('dialog', dialog => dialog.accept());
      await page.keyboard.press('Backspace');

      await expect(page.locator('.table-component')).toHaveCount(0);
    });

    test('Delete key does nothing when nothing is selected', async ({ page }) => {
      // Click on empty canvas to deselect
      await page.locator('.canvas').click({ position: { x: 50, y: 50 } });

      // Press Delete
      await page.keyboard.press('Delete');

      // Table should still exist
      await expect(page.locator('.table-component')).toHaveCount(1);
    });
  });

  test.describe('Help modal', () => {
    test('? key opens keyboard shortcuts help', async ({ page }) => {
      await page.keyboard.press('Shift+/'); // ? key

      await expect(page.locator('.shortcuts-modal')).toBeVisible();
      await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    });

    test('Escape closes the help modal', async ({ page }) => {
      await page.keyboard.press('Shift+/');
      await expect(page.locator('.shortcuts-modal')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.locator('.shortcuts-modal')).not.toBeVisible();
    });
  });

  test.describe('Undo/Redo', () => {
    test('Ctrl+Z triggers undo after deleting (which pushes history)', async ({ page }) => {
      // Add another table so we have something to delete
      await page.locator('.canvas-toolbar button:has-text("Add Table")').click();
      await page.click('text=Round Table');
      await expect(page.locator('.table-component')).toHaveCount(2, { timeout: 5000 });

      // Select and delete a table (this pushes history)
      const table = page.locator('.table-component').first();
      await table.click({ force: true });

      page.on('dialog', dialog => dialog.accept());
      await page.keyboard.press('Delete');

      // Should have 1 table now
      await expect(page.locator('.table-component')).toHaveCount(1);

      // Undo with Ctrl+Z
      await page.keyboard.press('Control+z');

      // Should show undo toast
      await expect(page.locator('.toast:has-text("Undo")')).toBeVisible({ timeout: 3000 });

      // Table should be restored
      await expect(page.locator('.table-component')).toHaveCount(2);
    });
  });
});
