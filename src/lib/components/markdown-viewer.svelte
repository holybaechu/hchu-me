<script lang="ts">
	import { tick } from 'svelte';
	import mermaid from 'mermaid';
	import { mode } from 'mode-watcher';
	import { setupMarkdownCodeInteractions } from '$lib/client/markdown-code';

	let { content }: { content: string } = $props();
	let contentRoot = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!contentRoot) return;
		return setupMarkdownCodeInteractions(contentRoot);
	});

	$effect(() => {
		if (!contentRoot) return;

		const currentMode = mode.current === 'dark' ? 'dark' : 'default';

		const renderMermaid = async () => {
			await tick();

			mermaid.initialize({
				startOnLoad: false,
				theme: currentMode,
				themeVariables: {
					darkMode: mode.current === 'dark'
				}
			});

			const nodes = contentRoot!.querySelectorAll('.language-mermaid');
			nodes.forEach((node) => {
				const originalText = node.getAttribute('data-original') || node.textContent || '';
				if (!node.getAttribute('data-original')) {
					node.setAttribute('data-original', originalText);
				}
				node.innerHTML = originalText;
				node.removeAttribute('data-processed');
			});

			if (nodes.length > 0) {
				await mermaid.run({ nodes: Array.from(nodes) as HTMLElement[] });
			}
		};

		renderMermaid();
	});
</script>

<article bind:this={contentRoot} class="prose max-w-none py-8 prose-neutral dark:prose-invert">
	<!-- eslint-disable svelte/no-at-html-tags -->
	{@html content}
	<!-- eslint-enable -->
</article>

<style>
	:global(.markdown-code-shell) {
		overflow: hidden;
		border-radius: var(--radius-xl);
		border: var(--color-border);
		background-color: var(--color-card);
	}

	:global(.markdown-code-toolbar) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--color-secondary);
	}

	:global(.markdown-code-label) {
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-muted-foreground);
	}

	:global(.markdown-code-copy-control) {
		display: flex;
		align-items: center;
		margin-right: 0.5rem;
	}

	:global(.markdown-code-copy-button) {
		color: var(--color-muted-foreground);
	}

	:global(.markdown-code-copy-icon) {
		width: 1rem;
		height: 1rem;
	}

	:global(.markdown-code-copy-button[data-copied='true']) {
		color: var(--color-green-600);
	}

	:global(.markdown-code-block) {
		margin: 0;
		overflow-x: auto;
		background: transparent;
		padding: 1rem;
		font-size: 0.875rem;
		line-height: 1.5rem;
	}

	:global(.markdown-code-block code) {
		display: block;
		min-width: max-content;
		background: transparent;
		padding: 0;
		font-size: 0.95em;
		color: var(--color-foreground);
	}

	:global(.markdown-code-block .hljs-comment),
	:global(.markdown-code-block .hljs-quote) {
		color: color-mix(in oklch, var(--color-muted-foreground) 78%, transparent);
	}

	:global(.markdown-code-block .hljs-string),
	:global(.markdown-code-block .hljs-symbol),
	:global(.markdown-code-block .hljs-regexp) {
		color: oklch(0.58 0.14 160);
	}

	:global(.markdown-code-block .hljs-keyword),
	:global(.markdown-code-block .hljs-selector-tag),
	:global(.markdown-code-block .hljs-subst) {
		color: oklch(0.58 0.2 285);
	}

	:global(.markdown-code-block .hljs-title.function_),
	:global(.markdown-code-block .hljs-function .hljs-title),
	:global(.markdown-code-block .hljs-title.class_) {
		color: oklch(0.62 0.17 245);
	}

	:global(.markdown-code-block .hljs-number),
	:global(.markdown-code-block .hljs-attr) {
		color: oklch(0.68 0.16 65);
	}

	:global(.markdown-code-block .hljs-literal),
	:global(.markdown-code-block .hljs-built_in) {
		color: oklch(0.65 0.18 30);
	}

	:global(.markdown-code-block .hljs-tag),
	:global(.markdown-code-block .hljs-name) {
		color: oklch(0.63 0.19 20);
	}

	:global(.markdown-code-block .hljs-attr),
	:global(.markdown-code-block .hljs-attribute),
	:global(.markdown-code-block .hljs-selector-id),
	:global(.markdown-code-block .hljs-selector-class) {
		color: oklch(0.62 0.17 250);
	}

	:global(.markdown-code-block .hljs-property),
	:global(.markdown-code-block .hljs-params) {
		color: oklch(0.56 0.16 210);
	}

	:global(.markdown-code-block .hljs-variable),
	:global(.markdown-code-block .hljs-template-variable),
	:global(.markdown-code-block .hljs-meta) {
		color: oklch(0.7 0.14 100);
	}

	:global(.dark .markdown-code-block .hljs-comment),
	:global(.dark .markdown-code-block .hljs-quote) {
		color: color-mix(in oklch, var(--color-muted-foreground) 92%, transparent);
	}

	:global(.dark .markdown-code-block .hljs-string),
	:global(.dark .markdown-code-block .hljs-symbol),
	:global(.dark .markdown-code-block .hljs-regexp) {
		color: oklch(0.78 0.16 160);
	}

	:global(.dark .markdown-code-block .hljs-keyword),
	:global(.dark .markdown-code-block .hljs-selector-tag),
	:global(.dark .markdown-code-block .hljs-subst) {
		color: oklch(0.78 0.2 300);
	}

	:global(.dark .markdown-code-block .hljs-title.function_),
	:global(.dark .markdown-code-block .hljs-function .hljs-title),
	:global(.dark .markdown-code-block .hljs-title.class_) {
		color: oklch(0.8 0.14 240);
	}

	:global(.dark .markdown-code-block .hljs-number),
	:global(.dark .markdown-code-block .hljs-attr) {
		color: oklch(0.82 0.14 75);
	}

	:global(.dark .markdown-code-block .hljs-literal),
	:global(.dark .markdown-code-block .hljs-built_in) {
		color: oklch(0.8 0.14 35);
	}

	:global(.dark .markdown-code-block .hljs-tag),
	:global(.dark .markdown-code-block .hljs-name) {
		color: oklch(0.8 0.18 30);
	}

	:global(.dark .markdown-code-block .hljs-attr),
	:global(.dark .markdown-code-block .hljs-attribute),
	:global(.dark .markdown-code-block .hljs-selector-id),
	:global(.dark .markdown-code-block .hljs-selector-class) {
		color: oklch(0.8 0.13 250);
	}

	:global(.dark .markdown-code-block .hljs-property),
	:global(.dark .markdown-code-block .hljs-params) {
		color: oklch(0.8 0.12 215);
	}

	:global(.dark .markdown-code-block .hljs-variable),
	:global(.dark .markdown-code-block .hljs-template-variable),
	:global(.dark .markdown-code-block .hljs-meta) {
		color: oklch(0.86 0.12 110);
	}

	:global(pre:has(.language-mermaid)) {
		background-color: transparent;
	}
</style>
