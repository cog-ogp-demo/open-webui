import { test, expect } from './helpers/fixtures';

test.describe('Playground - Navigation', () => {
	test('can navigate to playground page', async ({ page }) => {
		await page.goto('/playground');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/playground/);
	});

	test('can navigate to completions playground', async ({ page }) => {
		await page.goto('/playground/completions');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/playground\/completions/);
	});

	test('can navigate to images playground', async ({ page }) => {
		await page.goto('/playground/images');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/playground\/images/);
	});
});

test.describe('Calendar - Navigation', () => {
	test('can navigate to calendar page', async ({ page }) => {
		await page.goto('/calendar');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/calendar/);
	});
});

test.describe('Home Page', () => {
	test('can navigate to home page', async ({ page }) => {
		await page.goto('/home');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/home/);
	});
});

test.describe('Automations - Navigation', () => {
	test('can navigate to automations page', async ({ page }) => {
		await page.goto('/automations');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/automations/);
	});
});
