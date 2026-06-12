import { test, expect } from './helpers/fixtures';

test.describe('API - Health and Config', () => {
	test('backend health check responds', async ({ request, baseURL }) => {
		const response = await request.get(`${baseURL}/health`);
		expect(response.ok()).toBeTruthy();
	});

	test('backend config is accessible', async ({ request, baseURL }) => {
		const response = await request.get(`${baseURL}/api/config`);
		expect(response.ok()).toBeTruthy();

		const config = await response.json();
		expect(config).toBeDefined();
	});
});

test.describe('API - Chat Endpoints', () => {
	test('GET /api/v1/chats/list returns chat list', async ({ api }) => {
		const response = await api.getChatList();
		expect(response.ok()).toBeTruthy();
		expect(Array.isArray(await response.json())).toBeTruthy();
	});

	test('POST /api/v1/chats/new creates and returns chat', async ({ api }) => {
		const response = await api.createChat({
			title: 'API Test Chat',
			messages: [{ role: 'user', content: 'API test message' }]
		});
		expect(response.ok()).toBeTruthy();

		const chat = await response.json();
		expect(chat).toHaveProperty('id');

		// Cleanup
		await api.deleteChat(chat.id);
	});
});

test.describe('API - Knowledge Endpoints', () => {
	test('GET /api/v1/knowledge/ returns knowledge list', async ({ api }) => {
		const response = await api.getKnowledgeBases();
		expect(response.ok()).toBeTruthy();
	});

	test('knowledge CRUD lifecycle', async ({ api }) => {
		// Create
		const createRes = await api.createKnowledge('API Lifecycle KB', 'Test description');
		expect(createRes.ok()).toBeTruthy();
		const kb = await createRes.json();
		expect(kb.name).toBe('API Lifecycle KB');

		// Delete
		const deleteRes = await api.deleteKnowledge(kb.id);
		expect(deleteRes.ok()).toBeTruthy();
	});
});

test.describe('API - Prompt Endpoints', () => {
	test('GET /api/v1/prompts/ returns prompts list', async ({ api }) => {
		const response = await api.getPrompts();
		expect(response.ok()).toBeTruthy();
		expect(Array.isArray(await response.json())).toBeTruthy();
	});

	test('prompt CRUD lifecycle', async ({ api }) => {
		const suffix = Date.now();
		// Create
		const createRes = await api.createPrompt(`api-lifecycle-prompt-${suffix}`, `API Lifecycle Prompt ${suffix}`, 'Test prompt content');
		expect(createRes.ok()).toBeTruthy();
		const prompt = await createRes.json();
		expect(prompt.command).toBe(`api-lifecycle-prompt-${suffix}`);

		// Delete by prompt UUID
		const deleteRes = await api.deletePrompt(prompt.id);
		expect(deleteRes.ok()).toBeTruthy();
	});
});

test.describe('API - Tools Endpoints', () => {
	test('GET /api/v1/tools/ returns tools list', async ({ api }) => {
		const response = await api.getTools();
		expect(response.ok()).toBeTruthy();
		expect(Array.isArray(await response.json())).toBeTruthy();
	});
});

test.describe('API - Models Endpoints', () => {
	test('GET /api/v1/models/list returns models', async ({ api }) => {
		const response = await api.getModels();
		expect(response.ok()).toBeTruthy();
	});
});

test.describe('API - User Endpoints', () => {
	test('GET /api/v1/users/ returns user list', async ({ api }) => {
		const response = await api.getUsers();
		expect(response.ok()).toBeTruthy();

		const data = await response.json();
		expect(data).toHaveProperty('users');
		expect(Array.isArray(data.users)).toBeTruthy();
		expect(data.users.length).toBeGreaterThan(0);
	});
});

test.describe('API - Folder Endpoints', () => {
	test('folder CRUD lifecycle', async ({ api }) => {
		// Create
		const createRes = await api.createFolder('API Lifecycle Folder');
		expect(createRes.ok()).toBeTruthy();
		const folder = await createRes.json();
		expect(folder.name).toBe('API Lifecycle Folder');

		// List
		const listRes = await api.getFolders();
		expect(listRes.ok()).toBeTruthy();
		const folders = await listRes.json();
		expect(folders.some((f: { id: string }) => f.id === folder.id)).toBeTruthy();

		// Delete
		const deleteRes = await api.deleteFolder(folder.id);
		expect(deleteRes.ok()).toBeTruthy();
	});
});

test.describe('API - Notes Endpoints', () => {
	test('note CRUD lifecycle', async ({ api }) => {
		// Create
		const createRes = await api.createNote('API Lifecycle Note', { content: 'Test note' });
		expect(createRes.ok()).toBeTruthy();
		const note = await createRes.json();
		expect(note.title).toBe('API Lifecycle Note');

		// Get by ID
		const getRes = await api.getNoteById(note.id);
		expect(getRes.ok()).toBeTruthy();

		// Delete
		const deleteRes = await api.deleteNote(note.id);
		expect(deleteRes.ok()).toBeTruthy();
	});
});

test.describe('API - Auth Protection', () => {
	const protectedEndpoints = [
		'/api/v1/chats/list',
		'/api/v1/models/list',
		'/api/v1/knowledge/',
		'/api/v1/prompts/',
		'/api/v1/tools/',
		'/api/v1/users/',
		'/api/v1/notes/pinned',
		'/api/v1/folders/'
	];

	for (const endpoint of protectedEndpoints) {
		test(`${endpoint} rejects unauthenticated requests`, async ({ request, baseURL }) => {
			const response = await request.get(`${baseURL}${endpoint}`, {
				headers: { Authorization: 'Bearer bad-token' }
			});
			expect(response.status()).toBe(401);
		});
	}
});
