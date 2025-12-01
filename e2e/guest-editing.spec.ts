import { test, expect } from '@playwright/test';

test.describe('Guest Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear any persisted state and set up fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Add a table first using the toolbar dropdown
    await page.locator('.canvas-toolbar button:has-text("Add Table")').click();
    await page.click('text=Round Table');

    // Add a guest using the toolbar button (not the sidebar one)
    // The toolbar's "Add Guest" button has class .add-guest-button
    await page.locator('.add-guest-button').click();

    // Wait for guest to appear on canvas
    await expect(page.locator('.canvas-guest')).toHaveCount(1, { timeout: 5000 });
  });

  test.describe('Double-click to edit', () => {
    test('double-clicking an unassigned guest opens the edit modal', async ({ page }) => {
      // Find the unassigned guest on canvas
      const canvasGuest = page.locator('.canvas-guest').first();
      await expect(canvasGuest).toBeVisible();

      // Double-click the guest
      await canvasGuest.dblclick();

      // Verify the edit modal opens
      await expect(page.locator('.guest-form-modal')).toBeVisible();

      // Verify it's editing the correct guest (name field should be populated)
      const nameInput = page.locator('.guest-form-modal input[type="text"]').first();
      await expect(nameInput).toHaveValue(/.+/);
    });

    test('double-clicking a seated guest opens the edit modal', async ({ page }) => {
      // Drag the guest to the table to seat them
      const guest = page.locator('.canvas-guest').first();
      const table = page.locator('.table-component').first();

      // Use drag and drop with specific source/target points
      const guestBox = await guest.boundingBox();
      const tableBox = await table.boundingBox();

      if (guestBox && tableBox) {
        await page.mouse.move(guestBox.x + guestBox.width / 2, guestBox.y + guestBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(tableBox.x + tableBox.width / 2, tableBox.y + tableBox.height / 2, { steps: 10 });
        await page.mouse.up();
      }

      // Wait for the guest to be seated
      await expect(page.locator('.seat-guest')).toBeVisible({ timeout: 5000 });

      // Double-click the seated guest
      const seatedGuest = page.locator('.seat-guest').first();
      await seatedGuest.dblclick({ force: true });

      // Verify the edit modal opens
      await expect(page.locator('.guest-form-modal')).toBeVisible({ timeout: 3000 });
    });

    test('edit modal can be closed with cancel button', async ({ page }) => {
      const canvasGuest = page.locator('.canvas-guest').first();
      await canvasGuest.dblclick();

      await expect(page.locator('.guest-form-modal')).toBeVisible();

      // Click cancel
      await page.click('button:has-text("Cancel")');

      // Modal should close
      await expect(page.locator('.guest-form-modal')).not.toBeVisible();
    });

    test('edit modal can be closed by clicking overlay', async ({ page }) => {
      const canvasGuest = page.locator('.canvas-guest').first();
      await canvasGuest.dblclick();

      await expect(page.locator('.guest-form-modal')).toBeVisible();

      // Click the overlay (outside the modal content)
      await page.locator('.modal-overlay').click({ position: { x: 10, y: 10 }, force: true });

      // Modal should close
      await expect(page.locator('.guest-form-modal')).not.toBeVisible();
    });
  });

  test.describe('Context menu to edit', () => {
    test('right-clicking an unassigned guest shows context menu with Edit option', async ({ page }) => {
      const canvasGuest = page.locator('.canvas-guest').first();
      await expect(canvasGuest).toBeVisible();

      // Right-click to open context menu
      await canvasGuest.click({ button: 'right' });

      // Verify context menu appears with Edit Guest option
      await expect(page.locator('.context-menu')).toBeVisible();
      await expect(page.locator('.context-menu-item:has-text("Edit Guest")')).toBeVisible();
    });

    test('clicking Edit Guest in context menu opens the edit modal', async ({ page }) => {
      const canvasGuest = page.locator('.canvas-guest').first();
      await canvasGuest.click({ button: 'right' });

      // Click Edit Guest
      await page.click('.context-menu-item:has-text("Edit Guest")');

      // Verify the edit modal opens
      await expect(page.locator('.guest-form-modal')).toBeVisible();
    });

    test('right-clicking a seated guest shows context menu with Edit option', async ({ page }) => {
      // Seat the guest first
      const guest = page.locator('.canvas-guest').first();
      const table = page.locator('.table-component').first();

      const guestBox = await guest.boundingBox();
      const tableBox = await table.boundingBox();

      if (guestBox && tableBox) {
        await page.mouse.move(guestBox.x + guestBox.width / 2, guestBox.y + guestBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(tableBox.x + tableBox.width / 2, tableBox.y + tableBox.height / 2, { steps: 10 });
        await page.mouse.up();
      }

      await expect(page.locator('.seat-guest')).toBeVisible({ timeout: 5000 });

      const seatedGuest = page.locator('.seat-guest').first();

      // Right-click to open context menu
      await seatedGuest.click({ button: 'right', force: true });

      // Verify context menu appears with Edit Guest option
      await expect(page.locator('.context-menu')).toBeVisible();
      await expect(page.locator('.context-menu-item:has-text("Edit Guest")')).toBeVisible();
    });
  });

  test.describe('Edit modal functionality', () => {
    test('can edit guest name and save', async ({ page }) => {
      const canvasGuest = page.locator('.canvas-guest').first();
      await canvasGuest.dblclick();

      await expect(page.locator('.guest-form-modal')).toBeVisible();

      // Clear and type new name
      const nameInput = page.locator('.guest-form-modal input[type="text"]').first();
      await nameInput.clear();
      await nameInput.fill('Test Guest Name');

      // Save
      await page.click('button:has-text("Save")');

      // Modal should close
      await expect(page.locator('.guest-form-modal')).not.toBeVisible();
    });
  });
});
