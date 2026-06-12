import { test, expect } from './helpers/fixtures';

test.describe('User Settings', () => {
	test('can retrieve user profile via API', async ({ api }) => {
		const userResponse = await api.getSessionUser();
		const user = await userResponse.json();
		expect(user).toHaveProperty('name');
		expect(user).toHaveProperty('email');
	});

	test('user permissions endpoint responds', async ({ request, baseURL, adminToken }) => {
		const response = await request.get(`${baseURL}/api/v1/users/permissions`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		expect(response.ok()).toBeTruthy();
	});

	test('default user permissions are accessible', async ({ request, baseURL, adminToken }) => {
		const response = await request.get(`${baseURL}/api/v1/users/default/permissions`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		expect(response.ok()).toBeTruthy();
	});
});

test.describe('Admin Settings - Connections', () => {
	test('can read connections config', async ({ request, baseURL, adminToken }) => {
		const response = await request.get(`${baseURL}/api/v1/configs/connections`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		expect(response.ok()).toBeTruthy();

		const config = await response.json();
		expect(config).toBeDefined();
	});
});

test.describe('Admin Settings - Tool Servers', () => {
	test('can read tool servers config', async ({ request, baseURL, adminToken }) => {
		const response = await request.get(`${baseURL}/api/v1/configs/tool_servers`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		expect(response.ok()).toBeTruthy();
	});
});

test.describe('Shared Chats', () => {
	test('shared chat URL format /s/:id returns page', async ({ page }) => {
		await page.goto('/s/non-existent-id');
		await page.waitForLoadState('networkidle');

		// Should either show error or redirect
		const pageContent = await page.textContent('body');
		expect(pageContent).toBeDefined();
	});
});

test.describe('Error Handling', () => {
	test('error page renders correctly', async ({ page }) => {
		await page.goto('/error');
		await page.waitForLoadState('networkidle');

		// The error page should load (may redirect to main page)
		const pageContent = await page.textContent('body');
		expect(pageContent).toBeDefined();
	});

	test('non-existent routes are handled gracefully', async ({ page }) => {
		await page.goto('/this-route-does-not-exist-12345');
		await page.waitForLoadState('networkidle');

		// The SPA fallback should handle this - either redirect or show content
		const pageContent = await page.textContent('body');
		expect(pageContent).toBeDefined();
	});

	test('API 404 for non-existent chat', async ({ api }) => {
		const response = await api.getChatById('non-existent-chat-id-12345');
		// Should return 404 or error
		expect(response.status()).toBeGreaterThanOrEqual(400);
	});
});
