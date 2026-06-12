import { test, expect } from './helpers/fixtures';

test.describe('Authentication', () => {
	test('authenticated user is redirected from /auth to home', async ({ page }) => {
		await page.goto('/auth');
		// Authenticated users should not stay on /auth
		await expect(page).not.toHaveURL(/\/auth/, { timeout: 10_000 });
	});

	test('session user info is accessible via API', async ({ api }) => {
		const response = await api.getSessionUser();
		expect(response.ok()).toBeTruthy();

		const user = await response.json();
		expect(user).toHaveProperty('id');
		expect(user).toHaveProperty('email');
		expect(user).toHaveProperty('name');
		expect(user).toHaveProperty('role');
		expect(user.role).toBe('admin');
	});

	test('admin config is accessible', async ({ api }) => {
		const response = await api.getAdminConfig();
		expect(response.ok()).toBeTruthy();

		const config = await response.json();
		expect(config).toBeDefined();
	});

	test('unauthenticated API request returns 401', async ({ request, baseURL }) => {
		const response = await request.get(`${baseURL}/api/v1/auths/`, {
			headers: { Authorization: 'Bearer invalid-token' }
		});
		expect(response.status()).toBe(401);
	});

	test('main app page loads for authenticated user', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Should not be on auth page
		await expect(page).not.toHaveURL(/\/auth/);

		// Sidebar should be present
		const sidebar = page.locator('#sidebar');
		await expect(sidebar).toBeVisible({ timeout: 10_000 });
	});
});
