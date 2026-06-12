// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import Stub from './__mocks__/StubComponent.svelte';

vi.mock('$lib/components/common/Tooltip.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/common/Dropdown.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/DocumentPage.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/EllipsisHorizontal.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/Download.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/GarbageBin.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/Pencil.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/common/Spinner.svelte', () => ({ default: Stub }));
vi.mock('./DirectoryRow.svelte', () => ({ default: Stub }));

vi.mock('$lib/constants', () => ({ WEBUI_BASE_URL: 'http://localhost' }));

vi.mock('$lib/utils', () => ({
	capitalizeFirstLetter: (s: string) => s,
	formatFileSize: (n: number) => `${n}B`
}));

vi.mock('$lib/dayjs', () => {
	const dayjs = (val?: any) => ({ format: () => '', fromNow: () => '' });
	dayjs.extend = () => {};
	return { default: dayjs };
});
vi.mock('dayjs/plugin/duration', () => ({ default: {} }));
vi.mock('dayjs/plugin/relativeTime', () => ({ default: {} }));

async function renderFiles(props: Record<string, any>) {
	const i18nStore = writable({ t: (key: string) => key });
	const { default: Files } = await import('./Files.svelte');
	return render(Files, {
		props,
		context: new Map([['i18n', i18nStore]])
	});
}

const sampleFile = {
	id: 'file-1',
	name: 'test-doc.pdf',
	meta: { name: 'test-doc.pdf', size: 1024 },
	updated_at: Date.now() / 1000
};

describe('Files – rename input keyboard handling', () => {
	let onClick: ReturnType<typeof vi.fn>;
	let onRename: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		onClick = vi.fn();
		onRename = vi.fn();
	});

	it('should NOT trigger onClick when Space is pressed during rename', async () => {
		const { container } = await renderFiles({
			knowledge: { write_access: true },
			files: [sampleFile],
			directories: [],
			onClick,
			onRename
		});

		const fileRowButton = Array.from(container.querySelectorAll('button')).find((btn) =>
			btn.classList.contains('flex-1')
		);
		expect(fileRowButton).toBeTruthy();
		await fireEvent.dblClick(fileRowButton!);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		onClick.mockClear();
		await fireEvent.keyDown(input, { key: ' ', code: 'Space' });

		expect(onClick).not.toHaveBeenCalled();
	});

	it('should submit rename when Enter is pressed', async () => {
		const { container } = await renderFiles({
			knowledge: { write_access: true },
			files: [sampleFile],
			directories: [],
			onClick,
			onRename
		});

		const fileRowButton = Array.from(container.querySelectorAll('button')).find((btn) =>
			btn.classList.contains('flex-1')
		);
		await fireEvent.dblClick(fileRowButton!);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		await fireEvent.input(input, { target: { value: 'new-name.pdf' } });
		await fireEvent.keyDown(input, { key: 'Enter' });

		expect(onRename).toHaveBeenCalled();
	});

	it('should cancel rename when Escape is pressed', async () => {
		const { container } = await renderFiles({
			knowledge: { write_access: true },
			files: [sampleFile],
			directories: [],
			onClick,
			onRename
		});

		const fileRowButton = Array.from(container.querySelectorAll('button')).find((btn) =>
			btn.classList.contains('flex-1')
		);
		await fireEvent.dblClick(fileRowButton!);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		await fireEvent.keyDown(input, { key: 'Escape' });

		const inputAfter = container.querySelector('input');
		expect(inputAfter).toBeNull();
		expect(onRename).not.toHaveBeenCalled();
	});

	it('should stop keydown propagation for any key during rename', async () => {
		const { container } = await renderFiles({
			knowledge: { write_access: true },
			files: [sampleFile],
			directories: [],
			onClick,
			onRename
		});

		const fileRowButton = Array.from(container.querySelectorAll('button')).find((btn) =>
			btn.classList.contains('flex-1')
		);
		await fireEvent.dblClick(fileRowButton!);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();
		onClick.mockClear();

		await fireEvent.keyDown(input, { key: 'a' });
		await fireEvent.keyDown(input, { key: ' ' });
		await fireEvent.keyDown(input, { key: 'Tab' });

		expect(onClick).not.toHaveBeenCalled();
	});
});
