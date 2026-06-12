import { test, expect } from './helpers/fixtures';

test.describe('Notes - API Operations', () => {
	test('can create a note', async ({ api }) => {
		const response = await api.createNote('E2E Test Note', {
			content: 'This is a test note created by E2E tests'
		});
		expect(response.ok()).toBeTruthy();

		const note = await response.json();
		expect(note).toHaveProperty('id');
		expect(note.title).toBe('E2E Test Note');

		// Cleanup
		await api.deleteNote(note.id);
	});

	test('can retrieve a note by ID', async ({ api }) => {
		// Create a note first
		const createRes = await api.createNote('Retrievable Note', { content: 'retrieve me' });
		const created = await createRes.json();

		const response = await api.getNoteById(created.id);
		expect(response.ok()).toBeTruthy();

		const note = await response.json();
		expect(note.id).toBe(created.id);
		expect(note.title).toBe('Retrievable Note');

		// Cleanup
		await api.deleteNote(created.id);
	});

	test('can list pinned notes', async ({ api }) => {
		const response = await api.getNotes();
		expect(response.ok()).toBeTruthy();

		const data = await response.json();
		expect(Array.isArray(data)).toBeTruthy();
	});

	test('can delete a note', async ({ api }) => {
		const createResponse = await api.createNote('Delete Test Note', {
			content: 'To be deleted'
		});
		const note = await createResponse.json();

		const deleteResponse = await api.deleteNote(note.id);
		expect(deleteResponse.ok()).toBeTruthy();
	});
});

test.describe('Notes - UI Navigation', () => {
	test('can navigate to notes page', async ({ page }) => {
		await page.goto('/notes');
		await page.waitForLoadState('networkidle');

		const url = page.url();
		expect(url).toMatch(/\/notes/);
	});

	test('can view a specific note page', async ({ page, api }) => {
		const response = await api.createNote('View Specific Note', {
			content: 'Detailed content here'
		});
		const note = await response.json();

		await page.goto(`/notes/${note.id}`);
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL(new RegExp(`/notes/${note.id}`));

		// Cleanup
		await api.deleteNote(note.id);
	});
});
