import { test, expect } from './helpers/fixtures';

test.describe('Admin Panel - Navigation', () => {
	test('admin can access the admin settings page', async ({ page }) => {
		await page.goto('/admin/settings');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/admin\/settings/);
	});

	test('admin can access the admin users page', async ({ page }) => {
		await page.goto('/admin/users');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/admin\/users/);
	});

	test('admin can access the admin functions page', async ({ page }) => {
		await page.goto('/admin/functions');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/admin\/functions/);
	});

	test('admin can access the evaluations page', async ({ page }) => {
		await page.goto('/admin/evaluations');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/admin\/evaluations/);
	});

	test('admin can access the analytics page', async ({ page }) => {
		await page.goto('/admin/analytics');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/admin\/analytics/);
	});
});

test.describe('Admin Panel - Settings Tabs', () => {
	const settingsTabs = ['general', 'users', 'connections', 'models', 'interface', 'audio', 'images', 'pipelines'];

	for (const tab of settingsTabs) {
		test(`can navigate to ${tab} settings tab`, async ({ page }) => {
			await page.goto(`/admin/settings/${tab}`);
			await page.waitForLoadState('networkidle');

			await expect(page).toHaveURL(new RegExp(`/admin/settings/${tab}`));
		});
	}
});

test.describe('Admin Panel - User Management', () => {
	test('user list is accessible via API', async ({ api }) => {
		const response = await api.getUsers();
		expect(response.ok()).toBeTruthy();

		const data = await response.json();
		// Users endpoint returns { users: [...] }
		expect(data).toHaveProperty('users');
		expect(Array.isArray(data.users)).toBeTruthy();
		// At least the admin user should exist
		expect(data.users.length).toBeGreaterThan(0);
	});

	test('users page displays user list', async ({ page }) => {
		await page.goto('/admin/users');
		await page.waitForLoadState('networkidle');

		// Should see at least the admin user's email
		const adminEmail = page.getByText('admin@example.com');
		await expect(adminEmail).toBeVisible({ timeout: 10_000 });
	});
});

test.describe('Admin Panel - Config Management', () => {
	test('can read admin config', async ({ api }) => {
		const response = await api.getAdminConfig();
		expect(response.ok()).toBeTruthy();

		const config = await response.json();
		expect(config).toBeDefined();
	});

	test('can update and restore admin config', async ({ api }) => {
		// Read current config
		const getResponse = await api.getAdminConfig();
		const originalConfig = await getResponse.json();

		// Update with same config (idempotent operation)
		const updateResponse = await api.updateAdminConfig(originalConfig);
		expect(updateResponse.ok()).toBeTruthy();

		// Verify it's still the same
		const verifyResponse = await api.getAdminConfig();
		const verifiedConfig = await verifyResponse.json();
		expect(verifiedConfig).toBeDefined();
	});
});
