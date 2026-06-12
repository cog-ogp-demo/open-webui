import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import Files from './Files.svelte';

// Mock i18n context
const i18nStore = writable({
	t: (key: string, params?: Record<string, string>) => {
		if (params) {
			return Object.entries(params).reduce(
				(str, [k, v]) => str.replace(`{{${k}}}`, v),
				key
			);
		}
		return key;
	}
});

vi.mock('$lib/constants', () => ({
	WEBUI_BASE_URL: 'http://localhost'
}));

vi.mock('$lib/utils', () => ({
	capitalizeFirstLetter: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
	formatFileSize: (size: number) => `${size} B`
}));

vi.mock('$lib/dayjs', () => {
	const dayjs = (val?: any) => ({
		format: () => '2024-01-01',
		fromNow: () => '1 day ago'
	});
	dayjs.extend = () => {};
	return { default: dayjs };
});

vi.mock('dayjs/plugin/duration', () => ({ default: {} }));
vi.mock('dayjs/plugin/relativeTime', () => ({ default: {} }));

describe('Files.svelte - rename input keyboard handling', () => {
	const mockFile = {
		id: 'file-1',
		name: 'test-document.pdf',
		meta: { name: 'test-document.pdf', size: 1024 },
		updated_at: Date.now() / 1000
	};

	let onClickMock: ReturnType<typeof vi.fn>;
	let onRenameMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		onClickMock = vi.fn();
		onRenameMock = vi.fn();
	});

	it('should NOT trigger onClick when Space is pressed while renaming', async () => {
		const { container } = render(Files, {
			props: {
				knowledge: { write_access: true },
				files: [mockFile],
				directories: [],
				selectedFileId: null,
				onClick: onClickMock,
				onDelete: vi.fn(),
				onRename: onRenameMock,
				onNavigateDirectory: vi.fn(),
				onRenameDirectory: vi.fn(),
				onDeleteDirectory: vi.fn(),
				onMoveFileToDirectory: vi.fn(),
				onMoveDirectoryToDirectory: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Trigger rename mode by double-clicking the file button
		const fileButton = container.querySelector(
			'button.relative.flex.items-center'
		) as HTMLElement;
		expect(fileButton).toBeTruthy();

		await fireEvent.dblClick(fileButton);

		// The input should now be visible
		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		// Reset onClick mock in case dblclick triggered it
		onClickMock.mockClear();

		// Press Space in the rename input
		await fireEvent.keyDown(input, { key: ' ', code: 'Space' });

		// onClick should NOT have been called - this was the bug
		expect(onClickMock).not.toHaveBeenCalled();
	});

	it('should allow typing Space in the rename input', async () => {
		const { container } = render(Files, {
			props: {
				knowledge: { write_access: true },
				files: [mockFile],
				directories: [],
				selectedFileId: null,
				onClick: onClickMock,
				onDelete: vi.fn(),
				onRename: onRenameMock,
				onNavigateDirectory: vi.fn(),
				onRenameDirectory: vi.fn(),
				onDeleteDirectory: vi.fn(),
				onMoveFileToDirectory: vi.fn(),
				onMoveDirectoryToDirectory: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Enter rename mode
		const fileButton = container.querySelector(
			'button.relative.flex.items-center'
		) as HTMLElement;
		await fireEvent.dblClick(fileButton);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		// Type a space character
		await fireEvent.input(input, { target: { value: 'test document.pdf' } });

		// The input value should contain the space
		expect(input.value).toBe('test document.pdf');
	});

	it('should still submit rename on Enter', async () => {
		const { container } = render(Files, {
			props: {
				knowledge: { write_access: true },
				files: [mockFile],
				directories: [],
				selectedFileId: null,
				onClick: onClickMock,
				onDelete: vi.fn(),
				onRename: onRenameMock,
				onNavigateDirectory: vi.fn(),
				onRenameDirectory: vi.fn(),
				onDeleteDirectory: vi.fn(),
				onMoveFileToDirectory: vi.fn(),
				onMoveDirectoryToDirectory: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Enter rename mode
		const fileButton = container.querySelector(
			'button.relative.flex.items-center'
		) as HTMLElement;
		await fireEvent.dblClick(fileButton);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		// Change the value and press Enter
		await fireEvent.input(input, { target: { value: 'new-name.pdf' } });
		await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

		// onRename should have been called with the new name
		expect(onRenameMock).toHaveBeenCalledWith('file-1', 'new-name.pdf');
	});

	it('should cancel rename on Escape without triggering onClick', async () => {
		const { container } = render(Files, {
			props: {
				knowledge: { write_access: true },
				files: [mockFile],
				directories: [],
				selectedFileId: null,
				onClick: onClickMock,
				onDelete: vi.fn(),
				onRename: onRenameMock,
				onNavigateDirectory: vi.fn(),
				onRenameDirectory: vi.fn(),
				onDeleteDirectory: vi.fn(),
				onMoveFileToDirectory: vi.fn(),
				onMoveDirectoryToDirectory: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Enter rename mode
		const fileButton = container.querySelector(
			'button.relative.flex.items-center'
		) as HTMLElement;
		await fireEvent.dblClick(fileButton);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();
		onClickMock.mockClear();

		// Press Escape
		await fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

		// onClick should NOT be called
		expect(onClickMock).not.toHaveBeenCalled();
		// onRename should NOT be called (rename was cancelled)
		expect(onRenameMock).not.toHaveBeenCalled();
	});

	it('should not propagate any keydown events from rename input to parent button', async () => {
		const { container } = render(Files, {
			props: {
				knowledge: { write_access: true },
				files: [mockFile],
				directories: [],
				selectedFileId: null,
				onClick: onClickMock,
				onDelete: vi.fn(),
				onRename: onRenameMock,
				onNavigateDirectory: vi.fn(),
				onRenameDirectory: vi.fn(),
				onDeleteDirectory: vi.fn(),
				onMoveFileToDirectory: vi.fn(),
				onMoveDirectoryToDirectory: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Enter rename mode
		const fileButton = container.querySelector(
			'button.relative.flex.items-center'
		) as HTMLElement;
		await fireEvent.dblClick(fileButton);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();
		onClickMock.mockClear();

		// Spy on the parent button to check if keydown propagates
		const parentButton = input.closest('button') as HTMLElement;
		const parentKeydownHandler = vi.fn();
		parentButton.addEventListener('keydown', parentKeydownHandler);

		// Press Space - should NOT propagate
		await fireEvent.keyDown(input, { key: ' ', code: 'Space' });

		// The parent button should NOT receive the keydown event
		expect(parentKeydownHandler).not.toHaveBeenCalled();

		parentButton.removeEventListener('keydown', parentKeydownHandler);
	});
});
