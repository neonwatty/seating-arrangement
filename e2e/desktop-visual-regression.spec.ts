import { test, expect } from '@playwright/test';
import { enterApp, switchView } from './test-utils';

/**
 * Desktop Visual Regression Tests
 *
 * These tests capture screenshots of key desktop views to detect
 * unintended styling changes when modifying mobile CSS.
 *
 * Run with: npx playwright test desktop-visual-regression --project=chromium
 * Update snapshots with: npx playwright test desktop-visual-regression --project=chromium --update-snapshots
 *
 * NOTE: These tests require baseline snapshots to be generated and committed.
 * They are skipped in CI until baselines are available.
 */

// Skip in CI - visual regression tests need baseline snapshots to be generated locally first
test.skip(!!process.env.CI, 'Visual regression tests require baseline snapshots - run locally with --update-snapshots');

test.describe('Desktop Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for screenshots
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('canvas view with tables and guests', async ({ page }) => {
    await enterApp(page);

    // Wait for canvas to fully render
    await expect(page.locator('.canvas')).toBeVisible();
    await page.waitForTimeout(500); // Allow animations to settle

    // Capture full canvas view
    await expect(page).toHaveScreenshot('desktop-canvas-view.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('canvas view with toolbar expanded', async ({ page }) => {
    await enterApp(page);
    await expect(page.locator('.canvas')).toBeVisible();

    // Open the Add Table dropdown to show toolbar interaction
    const addTableBtn = page.locator('button:has-text("Add Table")').first();
    await addTableBtn.click();
    await expect(page.locator('.dropdown-menu')).toBeVisible();

    await expect(page).toHaveScreenshot('desktop-toolbar-dropdown.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('guest list view', async ({ page }) => {
    await enterApp(page);
    await switchView(page, 'guests');

    // Wait for guest list to render
    await expect(page.locator('.guest-management-view, .sidebar')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('desktop-guest-list-view.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('header styling', async ({ page }) => {
    await enterApp(page);

    // Focus on header area
    const header = page.locator('.header');
    await expect(header).toBeVisible();

    await expect(header).toHaveScreenshot('desktop-header.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('main toolbar styling', async ({ page }) => {
    await enterApp(page);

    // Focus on toolbar area
    const toolbar = page.locator('.main-toolbar');
    await expect(toolbar).toBeVisible();

    await expect(toolbar).toHaveScreenshot('desktop-main-toolbar.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('table properties panel', async ({ page }) => {
    await enterApp(page);

    // Click on a table to open properties panel
    const table = page.locator('.table-element').first();
    if (await table.isVisible()) {
      await table.click();
      await page.waitForTimeout(200);

      const propertiesPanel = page.locator('.table-properties-panel');
      if (await propertiesPanel.isVisible()) {
        await expect(propertiesPanel).toHaveScreenshot('desktop-table-properties.png', {
          maxDiffPixelRatio: 0.01,
          animations: 'disabled',
        });
      }
    }
  });

  test('sidebar with guests', async ({ page }) => {
    await enterApp(page);

    // Check if sidebar is visible on desktop
    const sidebar = page.locator('.sidebar');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('desktop-sidebar.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  });

  test('dark mode canvas view', async ({ page }) => {
    await enterApp(page);

    // Click theme toggle to switch to dark mode
    const themeBtn = page.locator('.theme-btn');
    await themeBtn.click(); // system -> light
    await themeBtn.click(); // light -> dark
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('desktop-canvas-dark-mode.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('keyboard shortcuts modal', async ({ page }) => {
    await enterApp(page);

    // Open shortcuts modal with ? key
    await page.keyboard.press('Shift+/');

    const modal = page.locator('.shortcuts-modal');
    await expect(modal).toBeVisible();

    await expect(modal).toHaveScreenshot('desktop-shortcuts-modal.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });
});
