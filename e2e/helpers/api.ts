import type { APIRequestContext } from '@playwright/test';

/**
 * Helper class for interacting with the Open WebUI REST API.
 * Uses the authenticated session token from the browser context.
 */
export class ApiHelper {
	private request: APIRequestContext;
	private baseURL: string;
	private token: string;

	constructor(request: APIRequestContext, baseURL: string, token: string) {
		this.request = request;
		this.baseURL = baseURL;
		this.token = token;
	}

	private headers() {
		return {
			Authorization: `Bearer ${this.token}`,
			'Content-Type': 'application/json'
		};
	}

	// ---- Auth ----
	async getSessionUser() {
		return this.request.get(`${this.baseURL}/api/v1/auths/`, {
			headers: this.headers()
		});
	}

	// ---- Chats ----
	async createChat(chat: object, folderId: string | null = null) {
		return this.request.post(`${this.baseURL}/api/v1/chats/new`, {
			headers: this.headers(),
			data: { chat, folder_id: folderId }
		});
	}

	async getChatList() {
		return this.request.get(`${this.baseURL}/api/v1/chats/list`, {
			headers: this.headers()
		});
	}

	async getChatById(id: string) {
		return this.request.get(`${this.baseURL}/api/v1/chats/${id}`, {
			headers: this.headers()
		});
	}

	async deleteChat(id: string) {
		return this.request.delete(`${this.baseURL}/api/v1/chats/${id}`, {
			headers: this.headers()
		});
	}

	async deleteAllChats() {
		return this.request.delete(`${this.baseURL}/api/v1/chats/`, {
			headers: this.headers()
		});
	}

	// ---- Models ----
	async getModels() {
		return this.request.get(`${this.baseURL}/api/v1/models/list`, {
			headers: this.headers()
		});
	}

	async createModel(model: object) {
		return this.request.post(`${this.baseURL}/api/v1/models/create`, {
			headers: this.headers(),
			data: model
		});
	}

	async deleteModel(id: string) {
		return this.request.delete(`${this.baseURL}/api/v1/models/model?id=${encodeURIComponent(id)}`, {
			headers: this.headers()
		});
	}

	// ---- Knowledge ----
	async getKnowledgeBases() {
		return this.request.get(`${this.baseURL}/api/v1/knowledge/`, {
			headers: this.headers()
		});
	}

	async createKnowledge(name: string, description: string) {
		return this.request.post(`${this.baseURL}/api/v1/knowledge/create`, {
			headers: this.headers(),
			data: { name, description }
		});
	}

	async deleteKnowledge(id: string) {
		return this.request.delete(`${this.baseURL}/api/v1/knowledge/${id}/delete`, {
			headers: this.headers()
		});
	}

	// ---- Prompts ----
	async getPrompts() {
		return this.request.get(`${this.baseURL}/api/v1/prompts/`, {
			headers: this.headers()
		});
	}

	async createPrompt(command: string, name: string, content: string) {
		return this.request.post(`${this.baseURL}/api/v1/prompts/create`, {
			headers: this.headers(),
			data: { command, name, content }
		});
	}

	async deletePrompt(id: string) {
		return this.request.delete(`${this.baseURL}/api/v1/prompts/id/${id}/delete`, {
			headers: this.headers()
		});
	}

	// ---- Tools ----
	async getTools() {
		return this.request.get(`${this.baseURL}/api/v1/tools/`, {
			headers: this.headers()
		});
	}

	async deleteToolById(id: string) {
		return this.request.delete(`${this.baseURL}/api/v1/tools/id/${id}/delete`, {
			headers: this.headers()
		});
	}

	// ---- Notes ----
	async getNotes() {
		return this.request.get(`${this.baseURL}/api/v1/notes/pinned`, {
			headers: this.headers()
		});
	}

	async getNoteById(id: string) {
		return this.request.get(`${this.baseURL}/api/v1/notes/${id}`, {
			headers: this.headers()
		});
	}

	async createNote(title: string, data: object) {
		return this.request.post(`${this.baseURL}/api/v1/notes/create`, {
			headers: this.headers(),
			data: { title, data }
		});
	}

	async deleteNote(id: string) {
		return this.request.delete(`${this.baseURL}/api/v1/notes/${id}/delete`, {
			headers: this.headers()
		});
	}

	// ---- Folders ----
	async getFolders() {
		return this.request.get(`${this.baseURL}/api/v1/folders/`, {
			headers: this.headers()
		});
	}

	async createFolder(name: string) {
		return this.request.post(`${this.baseURL}/api/v1/folders/`, {
			headers: this.headers(),
			data: { name }
		});
	}

	async deleteFolder(id: string) {
		return this.request.delete(`${this.baseURL}/api/v1/folders/${id}`, {
			headers: this.headers()
		});
	}

	// ---- Users ----
	async getUsers() {
		return this.request.get(`${this.baseURL}/api/v1/users/`, {
			headers: this.headers()
		});
	}

	// ---- Config ----
	async getAdminConfig() {
		return this.request.get(`${this.baseURL}/api/v1/auths/admin/config`, {
			headers: this.headers()
		});
	}

	async updateAdminConfig(config: object) {
		return this.request.post(`${this.baseURL}/api/v1/auths/admin/config`, {
			headers: this.headers(),
			data: config
		});
	}
}

/**
 * Extract auth token from browser localStorage via page evaluation.
 */
export async function getTokenFromPage(page: import('@playwright/test').Page): Promise<string> {
	return page.evaluate(() => localStorage.getItem('token') || '');
}
