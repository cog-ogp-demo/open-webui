import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123!';
const ADMIN_NAME = 'Admin User';
const authDir = path.join(__dirname, '.auth');
const adminFile = path.join(authDir, 'admin.json');

setup('create admin account and authenticate', async ({ page, baseURL }) => {
	fs.mkdirSync(authDir, { recursive: true });

	// Check if this is a fresh instance (onboarding flow)
	const configResponse = await page.request.get(`${baseURL}/api/config`);
	const config = await configResponse.json();
	const isOnboarding = config.onboarding === true;

	await page.goto('/auth');
	await page.waitForLoadState('networkidle');

	if (isOnboarding) {
		// First-time setup: dismiss onboarding overlay, then create admin account
		const getStartedBtn = page.getByLabel('Get started');
		await expect(getStartedBtn).toBeVisible({ timeout: 10_000 });
		await getStartedBtn.click();

		// After dismissing onboarding, we're in signup mode
		await page.locator('#name').fill(ADMIN_NAME);
		await page.locator('#email').fill(ADMIN_EMAIL);
		await page.locator('#password').fill(ADMIN_PASSWORD);
		await page.getByRole('button', { name: 'Create Admin Account' }).click();
	} else {
		// Existing instance - try to sign in
		await page.locator('#email').fill(ADMIN_EMAIL);
		await page.locator('#password').fill(ADMIN_PASSWORD);
		await page.getByRole('button', { name: 'Sign in' }).click();
	}

	// Wait for successful auth redirect away from /auth
	await expect(page).not.toHaveURL(/\/auth/, { timeout: 15_000 });
	await page.waitForLoadState('networkidle');

	await page.context().storageState({ path: adminFile });
});
