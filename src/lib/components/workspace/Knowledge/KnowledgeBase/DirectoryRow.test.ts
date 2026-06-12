import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import DirectoryRow from './DirectoryRow.svelte';

// Mock i18n context
const i18nStore = writable({
	t: (key: string) => key
});

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

describe('DirectoryRow.svelte - rename input keyboard handling', () => {
	const mockDirectory = {
		id: 'dir-1',
		name: 'My Folder',
		created_at: Date.now() / 1000,
		updated_at: Date.now() / 1000
	};

	let onNavigateMock: ReturnType<typeof vi.fn>;
	let onRenameMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		onNavigateMock = vi.fn();
		onRenameMock = vi.fn();
	});

	it('should NOT trigger onNavigate when Space is pressed while renaming', async () => {
		const { container } = render(DirectoryRow, {
			props: {
				directory: mockDirectory,
				writeAccess: true,
				onNavigate: onNavigateMock,
				onRename: onRenameMock,
				onDelete: vi.fn(),
				onFileDrop: vi.fn(),
				onDirDrop: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Trigger rename mode by double-clicking the row
		const row = container.querySelector('div.group') as HTMLElement;
		expect(row).toBeTruthy();

		await fireEvent.dblClick(row);

		// The input should now be visible
		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		// Reset onNavigate mock
		onNavigateMock.mockClear();

		// Press Space in the rename input
		await fireEvent.keyDown(input, { key: ' ', code: 'Space' });

		// onNavigate should NOT have been called - this was the bug
		expect(onNavigateMock).not.toHaveBeenCalled();
	});

	it('should still submit rename on Enter', async () => {
		const { container } = render(DirectoryRow, {
			props: {
				directory: mockDirectory,
				writeAccess: true,
				onNavigate: onNavigateMock,
				onRename: onRenameMock,
				onDelete: vi.fn(),
				onFileDrop: vi.fn(),
				onDirDrop: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Trigger rename mode
		const row = container.querySelector('div.group') as HTMLElement;
		await fireEvent.dblClick(row);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		// Change value and press Enter
		await fireEvent.input(input, { target: { value: 'Renamed Folder' } });
		await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

		// onRename should have been called
		expect(onRenameMock).toHaveBeenCalledWith('dir-1', 'Renamed Folder');
	});

	it('should cancel rename on Escape without triggering onNavigate', async () => {
		const { container } = render(DirectoryRow, {
			props: {
				directory: mockDirectory,
				writeAccess: true,
				onNavigate: onNavigateMock,
				onRename: onRenameMock,
				onDelete: vi.fn(),
				onFileDrop: vi.fn(),
				onDirDrop: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Trigger rename mode
		const row = container.querySelector('div.group') as HTMLElement;
		await fireEvent.dblClick(row);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();
		onNavigateMock.mockClear();

		// Press Escape
		await fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

		// onNavigate should NOT be called
		expect(onNavigateMock).not.toHaveBeenCalled();
		// The input should be gone (rename cancelled)
		expect(container.querySelector('input')).toBeNull();
	});

	it('should not propagate any keydown events from rename input to parent button', async () => {
		const { container } = render(DirectoryRow, {
			props: {
				directory: mockDirectory,
				writeAccess: true,
				onNavigate: onNavigateMock,
				onRename: onRenameMock,
				onDelete: vi.fn(),
				onFileDrop: vi.fn(),
				onDirDrop: vi.fn()
			},
			context: new Map([['i18n', i18nStore]])
		});

		// Trigger rename mode
		const row = container.querySelector('div.group') as HTMLElement;
		await fireEvent.dblClick(row);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

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
