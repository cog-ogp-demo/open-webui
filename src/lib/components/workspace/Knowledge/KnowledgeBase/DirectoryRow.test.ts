// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import Stub from './__mocks__/StubComponent.svelte';

vi.mock('$lib/components/common/Tooltip.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/common/Dropdown.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/GarbageBin.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/Pencil.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/Folder.svelte', () => ({ default: Stub }));
vi.mock('$lib/components/icons/EllipsisHorizontal.svelte', () => ({ default: Stub }));

vi.mock('$lib/dayjs', () => {
	const dayjs = (val?: any) => ({ format: () => '', fromNow: () => '' });
	dayjs.extend = () => {};
	return { default: dayjs };
});
vi.mock('dayjs/plugin/duration', () => ({ default: {} }));
vi.mock('dayjs/plugin/relativeTime', () => ({ default: {} }));

async function renderDirectoryRow(props: Record<string, any>) {
	const i18nStore = writable({ t: (key: string) => key });
	const { default: DirectoryRow } = await import('./DirectoryRow.svelte');
	return render(DirectoryRow, {
		props,
		context: new Map([['i18n', i18nStore]])
	});
}

const sampleDir = {
	id: 'dir-1',
	name: 'My Folder',
	created_at: Date.now() / 1000,
	updated_at: Date.now() / 1000
};

describe('DirectoryRow – rename input keyboard handling', () => {
	let onNavigate: ReturnType<typeof vi.fn>;
	let onRename: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		onNavigate = vi.fn();
		onRename = vi.fn();
	});

	it('should NOT trigger onNavigate when Space is pressed during rename', async () => {
		const { container } = await renderDirectoryRow({
			directory: sampleDir,
			writeAccess: true,
			onNavigate,
			onRename
		});

		const wrapper = container.querySelector('div.flex.cursor-pointer') as HTMLElement;
		expect(wrapper).toBeTruthy();
		await fireEvent.dblClick(wrapper);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		onNavigate.mockClear();
		await fireEvent.keyDown(input, { key: ' ', code: 'Space' });

		expect(onNavigate).not.toHaveBeenCalled();
	});

	it('should submit rename when Enter is pressed', async () => {
		const { container } = await renderDirectoryRow({
			directory: sampleDir,
			writeAccess: true,
			onNavigate,
			onRename
		});

		const wrapper = container.querySelector('div.flex.cursor-pointer') as HTMLElement;
		await fireEvent.dblClick(wrapper);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		await fireEvent.input(input, { target: { value: 'Renamed Folder' } });
		await fireEvent.keyDown(input, { key: 'Enter' });

		expect(onRename).toHaveBeenCalledWith('dir-1', 'Renamed Folder');
	});

	it('should cancel rename when Escape is pressed', async () => {
		const { container } = await renderDirectoryRow({
			directory: sampleDir,
			writeAccess: true,
			onNavigate,
			onRename
		});

		const wrapper = container.querySelector('div.flex.cursor-pointer') as HTMLElement;
		await fireEvent.dblClick(wrapper);

		const input = container.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();

		await fireEvent.keyDown(input, { key: 'Escape' });

		const inputAfter = container.querySelector('input');
		expect(inputAfter).toBeNull();
		expect(onRename).not.toHaveBeenCalled();
	});
});
