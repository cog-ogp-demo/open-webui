import { test, expect } from './helpers/fixtures';

test.describe('Workspace - Navigation', () => {
	test('can navigate to workspace page', async ({ page }) => {
		await page.goto('/workspace');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace/);
	});

	test('can navigate to models workspace', async ({ page }) => {
		await page.goto('/workspace/models');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/models/);
	});

	test('can navigate to prompts workspace', async ({ page }) => {
		await page.goto('/workspace/prompts');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/prompts/);
	});

	test('can navigate to knowledge workspace', async ({ page }) => {
		await page.goto('/workspace/knowledge');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/knowledge/);
	});

	test('can navigate to tools workspace', async ({ page }) => {
		await page.goto('/workspace/tools');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/tools/);
	});

	test('can navigate to functions create page', async ({ page }) => {
		await page.goto('/workspace/functions/create');
		await page.waitForLoadState('networkidle');

		// Functions create page may redirect to admin functions
		const url = page.url();
		expect(url).toMatch(/\/(workspace\/functions|admin\/functions)/);
	});

	test('can navigate to skills workspace', async ({ page }) => {
		await page.goto('/workspace/skills');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/skills/);
	});
});

test.describe('Workspace - Knowledge Base CRUD', () => {
	let knowledgeId: string;

	test('can create a knowledge base', async ({ api }) => {
		const response = await api.createKnowledge('E2E Test Knowledge', 'Created by E2E test suite');
		expect(response.ok()).toBeTruthy();

		const kb = await response.json();
		expect(kb).toHaveProperty('id');
		expect(kb.name).toBe('E2E Test Knowledge');
		expect(kb.description).toBe('Created by E2E test suite');
		knowledgeId = kb.id;
	});

	test('can list knowledge bases', async ({ api }) => {
		const response = await api.getKnowledgeBases();
		expect(response.ok()).toBeTruthy();

		const data = await response.json();
		// Knowledge endpoint returns { items: [...] }
		expect(data).toHaveProperty('items');
		expect(Array.isArray(data.items)).toBeTruthy();
	});

	test('knowledge base appears in workspace UI', async ({ page, api }) => {
		// Create a KB to check
		const createResponse = await api.createKnowledge('UI Visible KB', 'Should appear in UI');
		const kb = await createResponse.json();

		await page.goto('/workspace/knowledge');
		await page.waitForLoadState('networkidle');

		// The knowledge base name should be visible
		const kbName = page.getByText('UI Visible KB');
		await expect(kbName).toBeVisible({ timeout: 10_000 });

		// Cleanup
		await api.deleteKnowledge(kb.id);
	});

	test('can delete a knowledge base', async ({ api }) => {
		const createResponse = await api.createKnowledge('Delete Test KB', 'To be deleted');
		const kb = await createResponse.json();

		const deleteResponse = await api.deleteKnowledge(kb.id);
		expect(deleteResponse.ok()).toBeTruthy();
	});
});

test.describe('Workspace - Prompts CRUD', () => {
	test('can create a prompt', async ({ api }) => {
		const suffix = Date.now();
		const response = await api.createPrompt(`e2e-test-prompt-${suffix}`, `E2E Test Prompt ${suffix}`, 'You are a helpful test assistant.');
		expect(response.ok()).toBeTruthy();

		const prompt = await response.json();
		expect(prompt.command).toBe(`e2e-test-prompt-${suffix}`);

		// Cleanup
		await api.deletePrompt(prompt.id);
	});

	test('can list prompts', async ({ api }) => {
		const response = await api.getPrompts();
		expect(response.ok()).toBeTruthy();

		const prompts = await response.json();
		expect(Array.isArray(prompts)).toBeTruthy();
	});

	test('prompt appears in workspace UI', async ({ page, api }) => {
		const suffix = Date.now();
		const createRes = await api.createPrompt(`ui-visible-prompt-${suffix}`, 'UI Visible Prompt', 'Test content');
		const prompt = await createRes.json();

		await page.goto('/workspace/prompts');
		await page.waitForLoadState('networkidle');

		const promptTitle = page.getByText('UI Visible Prompt');
		await expect(promptTitle).toBeVisible({ timeout: 10_000 });

		// Cleanup
		await api.deletePrompt(prompt.id);
	});

	test('can navigate to create prompt page', async ({ page }) => {
		await page.goto('/workspace/prompts/create');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/prompts\/create/);
	});

	test('can delete a prompt', async ({ api }) => {
		const suffix = Date.now();
		const createRes = await api.createPrompt(`delete-test-prompt-${suffix}`, 'Delete Test Prompt', 'To be deleted');
		const prompt = await createRes.json();

		const deleteResponse = await api.deletePrompt(prompt.id);
		expect(deleteResponse.ok()).toBeTruthy();
	});
});

test.describe('Workspace - Models', () => {
	test('can list models via API', async ({ api }) => {
		const response = await api.getModels();
		expect(response.ok()).toBeTruthy();

		const data = await response.json();
		expect(data).toBeDefined();
	});

	test('models page loads correctly', async ({ page }) => {
		await page.goto('/workspace/models');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/models/);
	});

	test('can navigate to create model page', async ({ page }) => {
		await page.goto('/workspace/models/create');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/models\/create/);
	});
});

test.describe('Workspace - Tools', () => {
	test('can list tools via API', async ({ api }) => {
		const response = await api.getTools();
		expect(response.ok()).toBeTruthy();

		const tools = await response.json();
		expect(Array.isArray(tools)).toBeTruthy();
	});

	test('tools page loads correctly', async ({ page }) => {
		await page.goto('/workspace/tools');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/tools/);
	});

	test('can navigate to create tool page', async ({ page }) => {
		await page.goto('/workspace/tools/create');
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(/\/workspace\/tools\/create/);
	});
});
