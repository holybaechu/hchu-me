<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import CopyCheck from '@lucide/svelte/icons/copy-check';
	import { onDestroy } from 'svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as m from '$lib/paraglide/messages.js';

	const COPY_RESET_DELAY_MS = 2000;

	let { host }: { host: HTMLElement } = $props();
	let copied = $state(false);
	let open = $state(false);
	let resetTimer = $state<number | null>(null);

	const label = $derived(copied ? m.markdown_code_copied() : m.markdown_code_copy());

	function getCodeContent(): string {
		const shell = host.closest('.markdown-code-shell');
		return shell?.querySelector<HTMLElement>('code')?.textContent ?? '';
	}

	function clearResetTimer() {
		if (resetTimer) {
			window.clearTimeout(resetTimer);
			resetTimer = null;
		}
	}

	async function handleCopy() {
		const content = getCodeContent();
		if (!content) return;

		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			open = true;
			clearResetTimer();
			resetTimer = window.setTimeout(() => {
				copied = false;
				open = false;
				resetTimer = null;
			}, COPY_RESET_DELAY_MS);
		} catch (error) {
			console.error('Failed to copy code block:', error);
		}
	}

	onDestroy(() => {
		clearResetTimer();
	});
</script>

<Tooltip.Root bind:open>
	<Tooltip.Trigger
		type="button"
		class="markdown-code-copy-button"
		aria-label={label}
		title={label}
		data-copied={copied ? 'true' : 'false'}
		onclick={handleCopy}
	>
		{#if copied}
			<CopyCheck class="markdown-code-copy-icon" />
		{:else}
			<Copy class="markdown-code-copy-icon" />
		{/if}
		<span class="sr-only">{label}</span>
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={8}>{label}</Tooltip.Content>
</Tooltip.Root>
