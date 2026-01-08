import { Page, expect } from '@playwright/test';

// Mobile breakpoint matches useIsMobile hook: window.innerWidth < 768
const MOBILE_BREAKPOINT = 768;

/**
 * Check if the current page viewport is in mobile mode
 */
export async function isMobileViewport(page: Page): Promise<boolean> {
  const viewportSize = page.viewportSize();
  return viewportSize ? viewportSize.width < MOBILE_BREAKPOINT : false;
}

/**
 * Enter the app from landing page, bypassing onboarding.
 * After entering, clicks on the first event to go to canvas view.
 */
export async function enterApp(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const stored = localStorage.getItem('seating-arrangement-storage');
    // Use version 13 to match current store version and avoid migrations
    const data = stored ? JSON.parse(stored) : { state: {}, version: 13 };
    data.state = data.state || {};
    data.state.hasCompletedOnboarding = true;
    // Also mark immersive hints as seen to prevent them from blocking tests
    data.state.hasSeenImmersiveHint = true;
    data.state.hasSeenLandscapeHint = true;
    data.version = 13;
    localStorage.setItem('seating-arrangement-storage', JSON.stringify(data));
  });
  await page.goto('/');
  await page.click('button:has-text("Start Planning Free")');

  // Wait for navigation to events page (BrowserRouter uses clean URLs)
  await page.waitForURL(/\/events$/);
  await expect(page.locator('.header')).toBeVisible({ timeout: 5000 });

  // Click on first event to enter it (if event list view is shown)
  const eventCard = page.locator('.event-card').first();
  if (await eventCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await eventCard.click();
    // Wait for URL to change to event canvas view
    await page.waitForURL(/\/events\/[^/]+\/canvas/);
    // Wait for canvas to load (indicates we're inside an event)
    await expect(page.locator('.canvas')).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Check if we're in immersive canvas mode (MobileImmersiveCanvas)
 */
export async function isImmersiveCanvasMode(page: Page): Promise<boolean> {
  const cornerIndicator = page.locator('.corner-indicator');
  return await cornerIndicator.isVisible({ timeout: 500 }).catch(() => false);
}

/**
 * Open the bottom control sheet in immersive canvas mode
 * Uses corner indicator → transient top bar → menu button
 */
export async function openBottomControlSheet(page: Page): Promise<void> {
  const cornerIndicator = page.locator('.corner-indicator');
  if (await cornerIndicator.isVisible({ timeout: 500 }).catch(() => false)) {
    // Use tap for mobile devices (more reliable than click for touch emulation)
    await cornerIndicator.tap();
    // Small wait for tap to register and state to update
    await page.waitForTimeout(300);
    // Wait for transient top bar to slide in (look for the element becoming visible via transform)
    await expect(page.locator('.transient-top-bar.visible')).toBeVisible({ timeout: 5000 });
    // Now tap the menu button in the transient top bar
    await page.locator('.transient-top-bar .menu-btn').tap();
    // Wait for bottom control sheet to appear
    await expect(page.locator('.bottom-control-sheet')).toBeVisible({ timeout: 3000 });
  } else {
    throw new Error('Corner indicator not visible - cannot open bottom control sheet');
  }
}

/**
 * Open the mobile hamburger menu (only needed on mobile, non-canvas views)
 * In canvas view, the mobile menu sheet doesn't exist - use openBottomControlSheet instead
 */
export async function openMobileMenu(page: Page): Promise<void> {
  // Check if we're in immersive mode - if so, we can't open mobile menu sheet
  const isImmersive = await isImmersiveCanvasMode(page);
  if (isImmersive) {
    throw new Error('openMobileMenu called in immersive canvas mode. Use openBottomControlSheet instead.');
  }

  // Check if hamburger is visible
  const hamburger = page.locator('.hamburger-btn');
  const hamburgerVisible = await hamburger.isVisible({ timeout: 500 }).catch(() => false);

  if (hamburgerVisible) {
    await hamburger.click();
    await expect(page.locator('.mobile-menu-sheet')).toBeVisible();
    // Wait for animation to complete
    await page.waitForTimeout(200);
  } else {
    throw new Error('Hamburger button not visible and not in immersive mode');
  }
}

/**
 * Close the mobile menu if open
 */
export async function closeMobileMenu(page: Page): Promise<void> {
  const menuSheet = page.locator('.mobile-menu-sheet');
  if (await menuSheet.isVisible()) {
    await page.keyboard.press('Escape');
    await expect(menuSheet).not.toBeVisible();
  }
}

/**
 * Click "Add Table" and select a table shape.
 * On desktop: clicks dropdown button, then menu item
 * On mobile canvas (immersive): uses the FAB
 * On mobile other views: opens hamburger menu, clicks Add Table, then selects shape
 */
export async function addTable(page: Page, shape: 'round' | 'rectangle' = 'round'): Promise<void> {
  const isMobile = await isMobileViewport(page);

  if (isMobile) {
    // Check if we're in immersive canvas mode
    const isImmersive = await isImmersiveCanvasMode(page);

    if (isImmersive) {
      // Use the FAB in canvas view - wait for it to be visible first
      const fab = page.locator('.mobile-fab');
      await expect(fab).toBeVisible({ timeout: 3000 });
      await fab.tap();
      // Wait for FAB actions to expand
      await expect(page.locator('.fab-actions.visible')).toBeVisible({ timeout: 3000 });

      // Tap the appropriate table action
      const ariaLabel = shape === 'round' ? 'Add Round Table' : 'Add Rectangle Table';
      await page.locator(`.fab-action[aria-label="${ariaLabel}"]`).tap();
    } else {
      // Open mobile menu for non-canvas views
      await openMobileMenu(page);

      // Click "Add Table" to show submenu
      await page.locator('.menu-item:has-text("Add Table")').click();

      // Select the shape
      const shapeText = shape === 'round' ? 'Round Table' : 'Rectangle Table';
      await page.locator(`.menu-item:has-text("${shapeText}")`).click();
    }
  } else {
    // Desktop: use dropdown
    const addTableBtn = page.locator('button:has-text("Add Table")').first();
    await addTableBtn.click();
    await expect(page.locator('.dropdown-menu')).toBeVisible({ timeout: 3000 });

    const menuText = shape === 'round' ? 'Round' : 'Rectangle';
    await page.locator(`.dropdown-menu button:has-text("${menuText}")`).click();
  }
}

/**
 * Click the "Add Guest" button.
 * On mobile canvas (immersive): uses the FAB
 * On mobile other views: opens hamburger menu first
 */
export async function clickAddGuest(page: Page): Promise<void> {
  const isMobile = await isMobileViewport(page);

  if (isMobile) {
    // Check if we're in immersive canvas mode
    const isImmersive = await isImmersiveCanvasMode(page);

    if (isImmersive) {
      // Use the FAB in canvas view - wait for it to be visible first
      const fab = page.locator('.mobile-fab');
      await expect(fab).toBeVisible({ timeout: 3000 });
      await fab.tap();
      // Wait for FAB actions to expand
      await expect(page.locator('.fab-actions.visible')).toBeVisible({ timeout: 3000 });
      await page.locator('.fab-action[aria-label="Add Guest"]').tap();
    } else {
      await openMobileMenu(page);
      await page.locator('.menu-item:has-text("Add Guest")').click();
    }
  } else {
    await page.locator('button:has-text("Add Guest")').first().click();
  }
}

/**
 * Switch to a different view (Canvas or Guest List).
 * On mobile canvas (immersive): uses bottom control sheet
 * On mobile other views: uses bottom nav
 * On desktop: uses toolbar buttons
 */
export async function switchView(page: Page, view: 'canvas' | 'guests'): Promise<void> {
  const isMobile = await isMobileViewport(page);

  if (isMobile) {
    // Check if we're in immersive canvas mode
    const isImmersive = await isImmersiveCanvasMode(page);

    if (isImmersive) {
      // In canvas immersive mode, use the bottom control sheet
      await openBottomControlSheet(page);

      // Tap the appropriate view button in the sheet (tap is more reliable for mobile)
      const viewText = view === 'canvas' ? 'Canvas' : 'Guests';
      await page.locator(`.sheet-btn:has-text("${viewText}")`).tap();
    } else {
      // Use bottom nav buttons for quick view switching (only visible in non-canvas views)
      if (view === 'canvas') {
        await page.locator('.bottom-nav-item:has-text("Canvas")').click();
      } else {
        await page.locator('.bottom-nav-item:has-text("Guests")').click();
      }
    }
  } else {
    // Desktop: use toolbar buttons (button text is now "Canvas" and "Guests")
    if (view === 'canvas') {
      await page.click('button.toggle-option:has-text("Canvas")');
    } else {
      await page.click('button.toggle-option:has-text("Guests")');
    }
  }
  await page.waitForTimeout(300);
}

/**
 * Click the "Import" button.
 * On mobile canvas (immersive): uses bottom control sheet
 * On mobile other views: opens hamburger menu first
 */
export async function clickImport(page: Page): Promise<void> {
  const isMobile = await isMobileViewport(page);

  if (isMobile) {
    // Check if we're in immersive canvas mode
    const isImmersive = await isImmersiveCanvasMode(page);

    if (isImmersive) {
      // Use the bottom control sheet in canvas view (tap is more reliable for mobile)
      await openBottomControlSheet(page);
      await page.locator('.sheet-btn:has-text("Import")').tap();
    } else {
      await openMobileMenu(page);
      await page.locator('.menu-item:has-text("Import")').click();
    }
  } else {
    await page.locator('button:has-text("Import")').click();
  }
}

/**
 * Toggle the relationships panel.
 * On mobile canvas (immersive): uses bottom control sheet
 * On mobile other views: opens hamburger menu first, uses toggle
 * On desktop: clicks toolbar button
 */
export async function toggleRelationships(page: Page): Promise<void> {
  const isMobile = await isMobileViewport(page);

  if (isMobile) {
    // Check if we're in immersive canvas mode
    const isImmersive = await isImmersiveCanvasMode(page);

    if (isImmersive) {
      // Use the bottom control sheet in canvas view
      await openBottomControlSheet(page);
      // In bottom control sheet, button text is "Relations"
      // Use JavaScript click to bypass FAB overlay interception
      await page.locator('.sheet-btn:has-text("Relations")').evaluate((el: HTMLElement) => el.click());
      // Wait for sheet to close and state to update
      await page.waitForTimeout(500);
    } else {
      await openMobileMenu(page);
      await page.locator('.menu-item:has-text("Show Relationships")').click();
      // Menu stays open for toggles - close it
      await closeMobileMenu(page);
    }
  } else {
    await page.click('button:has-text("Relationships")');
  }
}

/**
 * Open the import wizard modal.
 * Handles navigation and button clicking for both mobile and desktop.
 */
export async function openImportWizard(page: Page): Promise<void> {
  await enterApp(page);

  // Navigate to Guest List view first
  await switchView(page, 'guests');

  // Click Import button
  await clickImport(page);

  // Wait for wizard modal to appear
  await expect(page.locator('.import-wizard-modal')).toBeVisible({ timeout: 3000 });
}

/**
 * Add a guest and verify it was created
 */
export async function addGuestAndWait(page: Page): Promise<void> {
  const initialCount = await page.locator('.canvas-guest').count() + await page.locator('.seat-guest').count();

  await clickAddGuest(page);
  await page.waitForTimeout(500);

  // Verify a guest was added
  const finalCount = await page.locator('.canvas-guest').count() + await page.locator('.seat-guest').count();
  expect(finalCount).toBeGreaterThan(initialCount);
}

/**
 * Helper to determine if grid controls are visible.
 * On mobile, grid controls may be hidden or in the menu.
 */
export async function isGridControlsVisible(page: Page): Promise<boolean> {
  const isMobile = await isMobileViewport(page);

  if (isMobile) {
    // Grid controls are not shown directly on mobile
    return false;
  }

  return await page.locator('.grid-controls').isVisible();
}

/**
 * Toggle grid controls visibility on mobile via menu
 */
export async function toggleGridControlsMobile(page: Page): Promise<void> {
  const isMobile = await isMobileViewport(page);

  if (isMobile) {
    await openMobileMenu(page);
    await page.locator('.menu-item:has-text("Grid Controls")').click();
  }
}
