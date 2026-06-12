import { test, expect } from './helpers/fixtures';

test.describe('Chat - API Operations', () => {
	let createdChatId: string;

	test('can create a new chat via API', async ({ api }) => {
		const chatPayload = {
			title: 'E2E Test Chat',
			messages: [
				{
					role: 'user',
					content: 'Hello from E2E test'
				}
			]
		};

		const response = await api.createChat(chatPayload);
		expect(response.ok()).toBeTruthy();

		const chat = await response.json();
		expect(chat).toHaveProperty('id');
		expect(chat.chat).toHaveProperty('title');
		createdChatId = chat.id;
	});

	test('can list chats', async ({ api }) => {
		const response = await api.getChatList();
		expect(response.ok()).toBeTruthy();

		const chats = await response.json();
		expect(Array.isArray(chats)).toBeTruthy();
	});

	test('can retrieve a chat by ID', async ({ api }) => {
		// First create a chat
		const createResponse = await api.createChat({
			title: 'Retrieval Test Chat',
			messages: [{ role: 'user', content: 'Test message' }]
		});
		const chat = await createResponse.json();
		const chatId = chat.id;

		// Now retrieve it
		const getResponse = await api.getChatById(chatId);
		expect(getResponse.ok()).toBeTruthy();

		const retrieved = await getResponse.json();
		expect(retrieved.id).toBe(chatId);

		// Cleanup
		await api.deleteChat(chatId);
	});

	test('can delete a chat', async ({ api }) => {
		// Create a chat to delete
		const createResponse = await api.createChat({
			title: 'Delete Test Chat',
			messages: [{ role: 'user', content: 'To be deleted' }]
		});
		const chat = await createResponse.json();

		// Delete it
		const deleteResponse = await api.deleteChat(chat.id);
		expect(deleteResponse.ok()).toBeTruthy();
	});

	test('can delete all chats', async ({ api }) => {
		// Create a couple of chats
		await api.createChat({ title: 'Bulk Delete 1', messages: [] });
		await api.createChat({ title: 'Bulk Delete 2', messages: [] });

		const deleteResponse = await api.deleteAllChats();
		expect(deleteResponse.ok()).toBeTruthy();

		// Verify chats are gone
		const listResponse = await api.getChatList();
		const chats = await listResponse.json();
		expect(chats.length).toBe(0);
	});
});

test.describe('Chat - UI Navigation', () => {
	test('main page loads with new chat interface', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Should not be on auth page
		await expect(page).not.toHaveURL(/\/auth/);

		// Should see the main chat area - look for the "New Chat" or model selector area
		const chatArea = page.locator('#chat-textarea').or(
			page.locator('textarea[placeholder]')
		).or(
			page.locator('[contenteditable="true"]')
		);
		await expect(chatArea.first()).toBeVisible({ timeout: 10_000 });
	});

	test('sidebar shows chat history section', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Sidebar should exist
		const sidebar = page.locator('#sidebar').or(page.locator('nav'));
		await expect(sidebar.first()).toBeVisible({ timeout: 10_000 });
	});

	test('can navigate to a specific chat page', async ({ page, api }) => {
		// Create a chat via API first
		const response = await api.createChat({
			title: 'Navigation Test Chat',
			messages: [{ role: 'user', content: 'Hello navigation' }]
		});
		const chat = await response.json();

		// Navigate to the chat
		await page.goto(`/c/${chat.id}`);
		await page.waitForLoadState('networkidle');

		// Should be on the chat page
		await expect(page).toHaveURL(new RegExp(`/c/${chat.id}`));

		// Cleanup
		await api.deleteChat(chat.id);
	});

	test('home page is accessible and shows chat interface', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// The main page should have a text area or input for chat
		const chatInput = page.locator('#chat-input, textarea, [contenteditable="true"]').first();
		await expect(chatInput).toBeVisible({ timeout: 10_000 });
	});
});

test.describe('Chat - Folders', () => {
	test('can create and delete a folder via API', async ({ api }) => {
		const createResponse = await api.createFolder('E2E Test Folder');
		expect(createResponse.ok()).toBeTruthy();

		const folder = await createResponse.json();
		expect(folder).toHaveProperty('id');
		expect(folder.name).toBe('E2E Test Folder');

		// Delete the folder
		const deleteResponse = await api.deleteFolder(folder.id);
		expect(deleteResponse.ok()).toBeTruthy();
	});

	test('can list folders', async ({ api }) => {
		const response = await api.getFolders();
		expect(response.ok()).toBeTruthy();

		const folders = await response.json();
		expect(Array.isArray(folders)).toBeTruthy();
	});

	test('can create a chat inside a folder', async ({ api }) => {
		// Create a folder
		const folderResponse = await api.createFolder('Chat Folder Test');
		const folder = await folderResponse.json();

		// Create a chat in the folder
		const chatResponse = await api.createChat(
			{ title: 'Chat in Folder', messages: [] },
			folder.id
		);
		expect(chatResponse.ok()).toBeTruthy();

		const chat = await chatResponse.json();
		expect(chat).toHaveProperty('id');
		expect(chat.folder_id).toBe(folder.id);

		// Cleanup
		await api.deleteChat(chat.id);
		await api.deleteFolder(folder.id);
	});
});
