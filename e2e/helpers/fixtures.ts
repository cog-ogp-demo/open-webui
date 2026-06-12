import { test as base, expect } from '@playwright/test';
import { ApiHelper, getTokenFromPage } from './api';

type E2EFixtures = {
	api: ApiHelper;
	adminToken: string;
};

/**
 * Extended Playwright test with custom fixtures for Open WebUI E2E tests.
 */
export const test = base.extend<E2EFixtures>({
	api: async ({ page, request, baseURL }, use) => {
		// Navigate to app to ensure localStorage token is available
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		const token = await getTokenFromPage(page);
		const api = new ApiHelper(request, baseURL!, token);
		await use(api);
	},
	adminToken: async ({ page }, use) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		const token = await getTokenFromPage(page);
		await use(token);
	}
});

export { expect };
