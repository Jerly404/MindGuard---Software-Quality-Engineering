import { test, expect } from '@playwright/test';

test('has title and can navigate', async ({ page }) => {
  await page.goto('/');
  
  // Asume que la página principal tiene el título de MindGuard o algo que la identifique
  // Update this depending on what's exactly in your index.html / App component.
  await expect(page).toHaveTitle(/MindGuard/);
});
