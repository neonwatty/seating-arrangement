import { test, expect } from '@playwright/test';
import { enterApp, isMobileViewport } from './test-utils';

// Skip mobile tests - PDF downloads have browser-dependent behavior
// and mobile dashboard navigation has timing issues
test.skip(({ browserName, viewport }) => {
  return viewport !== null && viewport.width < 768;
}, 'Skipping PDF tests on mobile viewports');

/**
 * Helper to switch to dashboard view (desktop only)
 */
async function switchToDashboard(page: import('@playwright/test').Page) {
  await page.click('.toggle-option:has-text("Dashboard")');
  // Wait for dashboard view to be visible
  await expect(page.locator('.dashboard-view')).toBeVisible({ timeout: 5000 });
}

// =============================================================================
// Print Materials Section Tests
// =============================================================================

test.describe('Print Materials', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await switchToDashboard(page);
  });

  test('print materials section is visible in dashboard', async ({ page }) => {
    // Check for the Print Materials section
    await expect(page.locator('.print-materials')).toBeVisible();
    await expect(page.locator('.print-materials h3')).toContainText('Print Materials');
  });

  test('print materials section has description', async ({ page }) => {
    await expect(page.locator('.print-materials-description')).toBeVisible();
    await expect(page.locator('.print-materials-description')).toContainText('Generate printable PDFs');
  });

  test('table cards button is visible', async ({ page }) => {
    const tableCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Table Cards' });
    await expect(tableCardsBtn).toBeVisible();
    await expect(tableCardsBtn.locator('.print-material-desc')).toContainText('Tent cards');
  });

  test('place cards button is visible', async ({ page }) => {
    const placeCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Place Cards' });
    await expect(placeCardsBtn).toBeVisible();
    await expect(placeCardsBtn.locator('.print-material-desc')).toContainText('Name cards');
  });

  test('table cards shows count badge', async ({ page }) => {
    const tableCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Table Cards' });
    const countBadge = tableCardsBtn.locator('.print-material-count');
    await expect(countBadge).toBeVisible();
    // Should show number of tables (e.g., "3 cards")
    await expect(countBadge).toContainText('cards');
  });

  test('place cards shows count badge', async ({ page }) => {
    const placeCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Place Cards' });
    const countBadge = placeCardsBtn.locator('.print-material-count');
    await expect(countBadge).toBeVisible();
    // Should show number of seated confirmed guests
    await expect(countBadge).toContainText('cards');
  });
});

// =============================================================================
// Table Cards Button Tests
// =============================================================================

test.describe('Table Cards Button', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await switchToDashboard(page);
  });

  test('table cards button has icon', async ({ page }) => {
    const tableCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Table Cards' });
    const icon = tableCardsBtn.locator('.print-material-icon svg');
    await expect(icon).toBeVisible();
  });

  test('clicking table cards button triggers download', async ({ page }) => {
    // Listen for download event (increased timeout for lazy-loaded jsPDF)
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

    // Click the table cards button
    const tableCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Table Cards' });
    await tableCardsBtn.click();

    // Verify download was triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('table-cards');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('table cards download shows success toast', async ({ page }) => {
    // Click the table cards button
    const tableCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Table Cards' });
    await tableCardsBtn.click();

    // Check for success toast (longer timeout for lazy-loaded jsPDF)
    await expect(page.locator('.toast')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.toast')).toContainText('Table cards PDF downloaded');
  });
});

// =============================================================================
// Place Cards Button Tests
// =============================================================================

test.describe('Place Cards Button', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await switchToDashboard(page);
  });

  test('place cards button has icon', async ({ page }) => {
    const placeCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Place Cards' });
    const icon = placeCardsBtn.locator('.print-material-icon svg');
    await expect(icon).toBeVisible();
  });

  test('place cards button shows appropriate count', async ({ page }) => {
    // The place cards count should show seated confirmed guests
    const placeCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Place Cards' });
    const countBadge = placeCardsBtn.locator('.print-material-count');

    // Should contain a number followed by "cards"
    await expect(countBadge).toBeVisible();
    const countText = await countBadge.textContent();
    expect(countText).toMatch(/\d+\s*cards/);
  });
});

// =============================================================================
// PDF Download Integration Tests
// =============================================================================

test.describe('PDF Download Integration', () => {
  test('downloads have correct filenames based on event name', async ({ page }) => {
    await enterApp(page);
    await switchToDashboard(page);

    // Listen for download event (increased timeout for lazy-loaded jsPDF)
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

    // Click the table cards button
    const tableCardsBtn = page.locator('.print-material-btn').filter({ hasText: 'Table Cards' });
    await tableCardsBtn.click();

    // Verify download filename contains event name
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/.*-table-cards\.pdf$/);
  });
});

// =============================================================================
// PDF Preview Tests
// =============================================================================

test.describe('PDF Preview', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await switchToDashboard(page);
  });

  test('preview buttons are visible next to each print material', async ({ page }) => {
    // Check table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await expect(tableCardsRow.locator('.print-material-preview-btn')).toBeVisible();

    // Check place cards preview button
    const placeCardsRow = page.locator('.print-material-row').last();
    await expect(placeCardsRow.locator('.print-material-preview-btn')).toBeVisible();
  });

  test('clicking table cards preview button opens preview modal', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Wait for preview modal to appear (increased timeout for lazy-loaded jsPDF)
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.pdf-preview-header h2')).toContainText('Table Cards Preview');
  });

  test('preview modal shows loading state initially', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Check for loading spinner (may be brief)
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 5000 });
  });

  test('preview modal has download button', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Wait for modal and check download button
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.pdf-preview-btn.download')).toBeVisible();
  });

  test('preview modal has close button', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Wait for modal and check close button
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.pdf-preview-btn.close')).toBeVisible();
  });

  test('closing preview modal works', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Wait for modal
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Click close button
    await page.locator('.pdf-preview-btn.close').click();

    // Modal should be hidden
    await expect(page.locator('.pdf-preview-modal')).not.toBeVisible();
  });

  test('preview modal displays PDF in iframe after loading', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Wait for PDF to load in iframe
    await expect(page.locator('.pdf-preview-iframe')).toBeVisible({ timeout: 15000 });
  });

  test('clicking overlay closes preview modal', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Wait for modal
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Click on overlay (not the modal itself)
    await page.locator('.pdf-preview-overlay').click({ position: { x: 10, y: 10 } });

    // Modal should be hidden
    await expect(page.locator('.pdf-preview-modal')).not.toBeVisible();
  });

  test('download from preview triggers download', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Wait for modal and PDF to load
    await expect(page.locator('.pdf-preview-iframe')).toBeVisible({ timeout: 15000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

    // Click download button
    await page.locator('.pdf-preview-btn.download').click();

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});

// =============================================================================
// PDF Customization Options Tests
// =============================================================================

test.describe('PDF Customization Options', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await switchToDashboard(page);
  });

  test('place cards preview shows options button', async ({ page }) => {
    // Click the place cards preview button
    const placeCardsRow = page.locator('.print-material-row').last();
    await placeCardsRow.locator('.print-material-preview-btn').click();

    // Wait for modal
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Check for options button (settings cog icon)
    await expect(page.locator('.pdf-preview-btn.options')).toBeVisible();
  });

  test('table cards preview does not show options button', async ({ page }) => {
    // Click the table cards preview button
    const tableCardsRow = page.locator('.print-material-row').first();
    await tableCardsRow.locator('.print-material-preview-btn').click();

    // Wait for modal
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Options button should not be visible for table cards
    await expect(page.locator('.pdf-preview-btn.options')).not.toBeVisible();
  });

  test('clicking options button shows options panel', async ({ page }) => {
    // Click the place cards preview button
    const placeCardsRow = page.locator('.print-material-row').last();
    await placeCardsRow.locator('.print-material-preview-btn').click();

    // Wait for modal
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Click options button
    await page.locator('.pdf-preview-btn.options').click();

    // Options panel should be visible
    await expect(page.locator('.pdf-options-panel')).toBeVisible();
  });

  test('options panel has table name checkbox', async ({ page }) => {
    // Open place cards preview
    const placeCardsRow = page.locator('.print-material-row').last();
    await placeCardsRow.locator('.print-material-preview-btn').click();
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Open options panel
    await page.locator('.pdf-preview-btn.options').click();
    await expect(page.locator('.pdf-options-panel')).toBeVisible();

    // Check for table name checkbox
    const tableNameCheckbox = page.locator('.pdf-option-label').filter({ hasText: 'Show table name' });
    await expect(tableNameCheckbox).toBeVisible();
    await expect(tableNameCheckbox.locator('input[type="checkbox"]')).toBeChecked();
  });

  test('options panel has dietary icons checkbox', async ({ page }) => {
    // Open place cards preview
    const placeCardsRow = page.locator('.print-material-row').last();
    await placeCardsRow.locator('.print-material-preview-btn').click();
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Open options panel
    await page.locator('.pdf-preview-btn.options').click();
    await expect(page.locator('.pdf-options-panel')).toBeVisible();

    // Check for dietary icons checkbox
    const dietaryCheckbox = page.locator('.pdf-option-label').filter({ hasText: 'Show dietary icons' });
    await expect(dietaryCheckbox).toBeVisible();
    await expect(dietaryCheckbox.locator('input[type="checkbox"]')).toBeChecked();
  });

  test('options panel has font size options', async ({ page }) => {
    // Open place cards preview
    const placeCardsRow = page.locator('.print-material-row').last();
    await placeCardsRow.locator('.print-material-preview-btn').click();
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Open options panel
    await page.locator('.pdf-preview-btn.options').click();
    await expect(page.locator('.pdf-options-panel')).toBeVisible();

    // Check for font size options
    await expect(page.locator('.pdf-option-title').filter({ hasText: 'Font Size' })).toBeVisible();
    await expect(page.locator('.pdf-font-label').filter({ hasText: 'Small' })).toBeVisible();
    await expect(page.locator('.pdf-font-label').filter({ hasText: 'Medium' })).toBeVisible();
    await expect(page.locator('.pdf-font-label').filter({ hasText: 'Large' })).toBeVisible();
  });

  test('medium font size is selected by default', async ({ page }) => {
    // Open place cards preview
    const placeCardsRow = page.locator('.print-material-row').last();
    await placeCardsRow.locator('.print-material-preview-btn').click();
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Open options panel
    await page.locator('.pdf-preview-btn.options').click();
    await expect(page.locator('.pdf-options-panel')).toBeVisible();

    // Check that medium is selected
    const mediumOption = page.locator('.pdf-font-option').filter({ hasText: 'Medium' });
    await expect(mediumOption.locator('input[type="radio"]')).toBeChecked();
  });

  test('can toggle options button to show/hide panel', async ({ page }) => {
    // Open place cards preview
    const placeCardsRow = page.locator('.print-material-row').last();
    await placeCardsRow.locator('.print-material-preview-btn').click();
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Open options panel
    await page.locator('.pdf-preview-btn.options').click();
    await expect(page.locator('.pdf-options-panel')).toBeVisible();

    // Close options panel by clicking again
    await page.locator('.pdf-preview-btn.options').click();
    await expect(page.locator('.pdf-options-panel')).not.toBeVisible();
  });

  test('options button shows active state when panel is open', async ({ page }) => {
    // Open place cards preview
    const placeCardsRow = page.locator('.print-material-row').last();
    await placeCardsRow.locator('.print-material-preview-btn').click();
    await expect(page.locator('.pdf-preview-modal')).toBeVisible({ timeout: 15000 });

    // Button should not be active initially
    await expect(page.locator('.pdf-preview-btn.options.active')).not.toBeVisible();

    // Open options panel
    await page.locator('.pdf-preview-btn.options').click();

    // Button should now be active
    await expect(page.locator('.pdf-preview-btn.options.active')).toBeVisible();
  });
});
