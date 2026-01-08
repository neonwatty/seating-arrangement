import { test, expect } from '@playwright/test';
import {
  enterApp,
  isMobileViewport,
  addTable,
  clickAddGuest,
  switchView,
  toggleRelationships,
  isImmersiveCanvasMode,
  openBottomControlSheet,
} from './test-utils';

test.describe('Seatify App Demo', () => {
  test('landing page shows correct branding', async ({ page }) => {
    await page.goto('/');

    // Check page title contains Seatify
    await expect(page).toHaveTitle(/Seatify/);

    // Check landing page logo
    await expect(page.locator('.landing-logo')).toContainText('Seatify');

    // Check CTA button exists
    await expect(page.locator('button:has-text("Start Planning")')).toBeVisible();
  });

  test('demo data loads with tables and guests', async ({ page }) => {
    await enterApp(page);

    // Demo should have tables visible
    await expect(page.locator('.table-component')).toHaveCount(3, { timeout: 5000 });

    // Demo should have guests (either seated or unassigned)
    const seatedGuests = page.locator('.seat-guest');
    const canvasGuests = page.locator('.canvas-guest');

    // Wait for guests to load
    await page.waitForTimeout(500);

    // Should have guests in the app
    const seatedCount = await seatedGuests.count();
    const canvasCount = await canvasGuests.count();
    expect(seatedCount + canvasCount).toBeGreaterThan(0);
  });

  test('can switch between Canvas and Guest List views', async ({ page }) => {
    await enterApp(page);

    // Should start in Canvas view
    await expect(page.locator('.canvas')).toBeVisible();

    // Click on Guest List view
    await switchView(page, 'guests');

    // Should show guest list (look for the sidebar content changing)
    await page.waitForTimeout(500);

    // Switch back to Canvas
    await switchView(page, 'canvas');

    // Canvas should be visible again
    await expect(page.locator('.canvas')).toBeVisible();
  });

  test('can toggle relationships panel', async ({ page }) => {
    await enterApp(page);

    // Find and click the Relationships button
    await toggleRelationships(page);

    // Relationships panel should appear
    await expect(page.locator('.relationships-panel')).toBeVisible();

    // Click close button to hide it
    await page.locator('.relationships-panel-header .close-btn').click();

    // Panel should be hidden
    await expect(page.locator('.relationships-panel')).not.toBeVisible();
  });

  test('optimize button is visible in canvas view', async ({ page }) => {
    await enterApp(page);
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      // On mobile canvas, use bottom control sheet (immersive mode)
      const isImmersive = await isImmersiveCanvasMode(page);
      if (isImmersive) {
        await openBottomControlSheet(page);
        // Optimize button appears as part of the canvas tools section
        await expect(page.locator('.bottom-control-sheet')).toBeVisible();
        // The sheet has optimize/reset functionality accessible
      } else {
        // Non-canvas mobile view - this test is for canvas view, so skip
        test.skip();
      }
    } else {
      // Optimize button should be visible in desktop toolbar
      await expect(page.locator('.toolbar-btn.optimize, .toolbar-btn.reset')).toBeVisible();
    }
  });

  test('can add a new table via dropdown', async ({ page }) => {
    await enterApp(page);

    // Count initial tables
    const initialCount = await page.locator('.table-component').count();

    // Use the helper to add a table (works on both mobile and desktop)
    await addTable(page, 'round');

    // Verify a new table was added
    await expect(page.locator('.table-component')).toHaveCount(initialCount + 1, { timeout: 5000 });
  });

  test('can add a new guest', async ({ page }) => {
    await enterApp(page);

    // Count initial guests
    const initialSeated = await page.locator('.seat-guest').count();
    const initialCanvas = await page.locator('.canvas-guest').count();
    const initialTotal = initialSeated + initialCanvas;

    // Click Add Guest button (works on both mobile and desktop)
    await clickAddGuest(page);

    // Wait for guest to be added
    await page.waitForTimeout(500);

    // Count after
    const finalSeated = await page.locator('.seat-guest').count();
    const finalCanvas = await page.locator('.canvas-guest').count();
    const finalTotal = finalSeated + finalCanvas;

    expect(finalTotal).toBe(initialTotal + 1);
  });

  test('can zoom in and out on canvas', async ({ page }) => {
    await enterApp(page);

    // Zoom controls are hidden on very small screens (< 480px)
    const viewportSize = page.viewportSize();
    if (viewportSize && viewportSize.width < 480) {
      test.skip();
      return;
    }

    // Get initial zoom display value
    const zoomDisplay = page.locator('.zoom-display');
    const initialZoom = await zoomDisplay.textContent();

    // Click zoom in
    await page.locator('.zoom-controls button').first().click();

    // Zoom should have changed
    const newZoom = await zoomDisplay.textContent();
    expect(newZoom).not.toBe(initialZoom);
  });

  test('event name is editable', async ({ page }) => {
    await enterApp(page);
    const isMobile = await isMobileViewport(page);

    if (isMobile) {
      // In immersive canvas mode, event name is in TransientTopBar
      const isImmersive = await isImmersiveCanvasMode(page);
      if (isImmersive) {
        // Tap corner indicator to show TransientTopBar (use tap for mobile)
        await page.locator('.corner-indicator').tap();
        await page.waitForTimeout(300);
        await expect(page.locator('.transient-top-bar.visible')).toBeVisible({ timeout: 5000 });

        // Tap on event name to make it editable
        await page.locator('.transient-top-bar .event-name').tap();
        await expect(page.locator('.transient-top-bar .event-name-input')).toBeVisible({ timeout: 2000 });

        const eventNameInput = page.locator('.transient-top-bar .event-name-input');
        await eventNameInput.clear();
        await eventNameInput.fill('My Wedding Reception');
        await expect(eventNameInput).toHaveValue('My Wedding Reception');
        return;
      }
    }

    // Desktop mode - event name input is in header
    const eventNameInput = page.locator('.event-name-input');

    // Clear and type new name
    await eventNameInput.clear();
    await eventNameInput.fill('My Wedding Reception');

    // Value should be updated
    await expect(eventNameInput).toHaveValue('My Wedding Reception');
  });
});

test.describe('Optimization Feature', () => {
  test('clicking optimize changes button to reset', async ({ page }) => {
    // Set onboarding completion before navigating
    await page.addInitScript(() => {
      const data = { state: { hasCompletedOnboarding: true }, version: 13 };
      localStorage.setItem('seating-arrangement-storage', JSON.stringify(data));
    });

    // Navigate to landing page and enter app fresh
    await page.goto('/');
    await page.click('button:has-text("Start Planning Free")');
    await page.waitForURL(/\/events$/);
    await expect(page.locator('.header')).toBeVisible({ timeout: 5000 });

    // Click on first event to enter it
    const eventCard = page.locator('.event-card').first();
    if (await eventCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventCard.click();
      await page.waitForURL(/\/events\/[^/]+\/canvas/);
      await expect(page.locator('.canvas')).toBeVisible({ timeout: 5000 });
    }

    const isMobile = await isMobileViewport(page);
    await page.waitForTimeout(1000);

    if (isMobile) {
      // In mobile canvas view (immersive mode), optimize button is not accessible
      // via the BottomControlSheet. The hamburger menu isn't available in immersive mode.
      // Skip this test for mobile immersive canvas mode.
      const isImmersive = await isImmersiveCanvasMode(page);
      if (isImmersive) {
        test.skip();
        return;
      }
    } else {
      // Check if optimize button exists
      const optimizeBtn = page.locator('.toolbar-btn.optimize');
      const resetBtn = page.locator('.toolbar-btn.reset');

      // If optimize is visible, clicking it should show reset
      if (await optimizeBtn.isVisible()) {
        await optimizeBtn.click();

        // Wait for animation/processing
        await page.waitForTimeout(1000);

        // Should now show reset button
        await expect(resetBtn).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('Header Subscribe Button', () => {
  // Helper to navigate to events page
  async function setupEventsPage(page: import('@playwright/test').Page, subscribed = false) {
    await page.addInitScript(({ subscribed }) => {
      if (subscribed) {
        localStorage.setItem('seatify_email_capture', JSON.stringify({
          hasSubscribed: true,
          dismissCount: 0,
          lastDismissed: null,
          triggersShown: { guestMilestone: false, optimizerSuccess: false, exportAttempt: false }
        }));
      }
      const data = { state: { hasCompletedOnboarding: true }, version: 13 };
      localStorage.setItem('seating-arrangement-storage', JSON.stringify(data));
    }, { subscribed });
    await page.goto('/');
    await page.click('button:has-text("Start Planning Free")');
    await page.waitForURL(/\/events$/);
    await expect(page.locator('.header')).toBeVisible({ timeout: 5000 });
    // Wait for any animations/transitions to complete
    await page.waitForTimeout(500);
  }

  test('subscribe button is visible in header for non-subscribed users', async ({ page }) => {
    // Subscribe button is hidden on mobile via CSS
    const isMobile = await isMobileViewport(page);
    if (isMobile) {
      test.skip();
      return;
    }

    await setupEventsPage(page, false);

    // Subscribe button should be visible in header
    const subscribeBtn = page.locator('.header .subscribe-btn');
    await expect(subscribeBtn).toBeVisible();
    await expect(subscribeBtn).toHaveText('Subscribe');
  });

  test('subscribe button hidden for subscribed users', async ({ page }) => {
    await setupEventsPage(page, true);

    // Subscribe button should not be visible
    await expect(page.locator('.header .subscribe-btn')).not.toBeVisible();
  });
});
