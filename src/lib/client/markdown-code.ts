import { mount, unmount } from 'svelte';
import MarkdownCodeCopyButton from '$lib/components/markdown-code-copy-button.svelte';

export function setupMarkdownCodeInteractions(root: HTMLElement): () => void {
	const mountPoints = Array.from(root.querySelectorAll<HTMLElement>('[data-copy-control]'));
	const mountedControls = mountPoints.map((target) =>
		mount(MarkdownCodeCopyButton, {
			target,
			props: { host: target }
		})
	);

	return () => {
		for (const control of mountedControls) {
			unmount(control);
		}
	};
}
