<script lang="ts">
	import { ArrowLeft, ExternalLink, Folder, Github } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { setupMarkdownCodeInteractions } from '$lib/client/markdown-code';
	import * as m from '$lib/paraglide/messages.js';
	import { tick } from 'svelte';
	import mermaid from 'mermaid';
	import { mode } from 'mode-watcher';
	import Seo from '$lib/components/seo.svelte';

	let { data } = $props();
	let contentRoot = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!contentRoot) return;

		return setupMarkdownCodeInteractions(contentRoot);
	});

	$effect(() => {
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

            const nodes = document.querySelectorAll('.language-mermaid');
            nodes.forEach(node => {
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

<Seo 
	title={`${data.project.title} | ${m.site_title()}`}
	description={data.project.description || data.project.title}
	type="article"
/>

<div class="py-6">
	<Button href="/" variant="ghost" class="gap-2">
		<ArrowLeft class="h-4 w-4" />
		{m.project_back()}
	</Button>
</div>

<header class="border-b border-border py-8">
	<div class="space-y-4">
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<Folder class="h-4 w-4" />
			<span>{m.project_title()}</span>
		</div>
		<div class="flex flex-wrap items-start justify-between gap-3">
			<h1 class="text-3xl font-bold md:text-4xl">{data.project.title}</h1>
			{#if data.project.github_url || data.project.website_url}
				<div class="flex shrink-0 flex-wrap items-center gap-1.5">
					{#if data.project.github_url}
						<Button
							href={data.project.github_url}
							target="_blank"
							rel="noopener noreferrer"
							variant="outline"
							aria-label={m.project_actions_open_github()}
							title={m.project_actions_github()}
						>
							<Github class="h-3.5 w-3.5" />
						</Button>
					{/if}
					{#if data.project.website_url}
						<Button
							href={data.project.website_url}
							target="_blank"
							rel="noopener noreferrer"
							variant="outline"
							aria-label={m.project_actions_open_website()}
							title={m.project_actions_website()}
						>
							<ExternalLink class="h-3.5 w-3.5" />
						</Button>
					{/if}
				</div>
			{/if}
		</div>
		{#if data.project.description}
			<p class="max-w-3xl text-lg text-muted-foreground">
				{data.project.description}
			</p>
		{/if}
		{#if data.project.techs.length > 0}
			<div class="flex flex-wrap gap-2 pt-2">
				{#each data.project.techs as tech (tech.name)}
					<span
						class="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
					>
						{#if tech.icon_url}
							<img src={tech.icon_url} alt="" class="h-4 w-4 rounded-sm object-contain" />
						{:else}
							<span
								class="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-muted text-[10px] uppercase text-muted-foreground"
							>
								{tech.name.slice(0, 1)}
							</span>
						{/if}
						{tech.name}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</header>

<article bind:this={contentRoot} class="prose max-w-none py-8 prose-neutral dark:prose-invert">
	<!-- eslint-disable svelte/no-at-html-tags -->
	{@html data.project.content}
	<!-- eslint-enable -->
</article>
